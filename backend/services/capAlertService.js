const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const Alert = require('../models/Alert');

const DEFAULT_FEED_URL = 'https://cap-sources.s3.amazonaws.com/in-imd-en/rss.xml';
const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true, trimValues: true, parseTagValue: false });
let feedEtag = null;
let feedLastModified = null;

const asArray = (value) => value == null ? [] : Array.isArray(value) ? value : [value];
const text = (value) => value == null ? '' : typeof value === 'object' ? (value['#text'] || '') : String(value);
const first = (value) => asArray(value)[0];

const requestWithRetry = async (url, headers = {}, attempts = Number(process.env.OFFICIAL_ALERT_RETRIES) || 3) => {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await axios.get(url, {
        headers,
        timeout: Number(process.env.OFFICIAL_ALERT_TIMEOUT_MS) || 15000,
        validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
      });
    } catch (error) {
      lastError = error;
      console.error(`[CAP] Request failed (${attempt + 1}/${attempts}) ${url}: ${error.message}`);
      if (attempt < attempts - 1) await new Promise((resolve) => setTimeout(resolve, Math.min(30000, 1000 * (2 ** attempt))));
    }
  }
  throw lastError;
};

const parsePolygon = (polygon) => {
  const values = text(polygon).trim().split(/\s+/).map((pair) => pair.split(',').map(Number));
  if (values.length < 3 || values.some((pair) => pair.length !== 2 || pair.some(Number.isNaN))) return null;
  return values.map(([lat, lon]) => [lon, lat]);
};

const parseCircle = (circle) => {
  const values = text(circle).trim().split(/\s+/).map(Number);
  if (values.length !== 3 || values.some(Number.isNaN)) return null;
  return { lat: values[0], lon: values[1] };
};

const polygonCentroid = (polygon) => {
  if (!polygon || polygon.length === 0) return null;
  const total = polygon.reduce((result, [lon, lat]) => ({ lon: result.lon + lon, lat: result.lat + lat }), { lon: 0, lat: 0 });
  return { type: 'Point', coordinates: [total.lon / polygon.length, total.lat / polygon.length] };
};

const parseCapAlert = (xml, source = 'IMD_CAP') => {
  const document = parser.parse(xml);
  const cap = document.alert || document.cap?.alert;
  if (!cap) throw new Error('CAP alert element not found');
  const info = first(cap.info) || {};
  const area = first(info.area) || {};
  const polygon = parsePolygon(area.polygon);
  const circle = parseCircle(area.circle);
  const coordinates = circle ? { type: 'Point', coordinates: [circle.lon, circle.lat] } : polygonCentroid(polygon);
  const areaDescription = asArray(info.area).map((item) => text(item.areaDesc)).filter(Boolean).join('; ');
  const expires = text(info.expires);
  const status = text(cap.msgType).toLowerCase() === 'cancel' || text(cap.status).toLowerCase() === 'cancelled'
    ? 'Cancelled' : (expires && new Date(expires).getTime() < Date.now() ? 'Expired' : 'Active');
  return {
    title: text(info.headline) || text(info.event) || 'Official disaster alert',
    description: text(info.description) || text(info.headline) || 'Official disaster alert',
    type: text(info.event) || 'Other', location: areaDescription || 'Location not specified by source', coordinates,
    polygon: polygon || undefined, severity: text(info.severity), status, source,
    externalAlertId: text(cap.identifier), sender: text(cap.sender), event: text(info.event), headline: text(info.headline),
    instruction: text(info.instruction), urgency: text(info.urgency), certainty: text(info.certainty),
    sentAt: new Date(text(cap.sent)), effectiveAt: text(info.effective) ? new Date(text(info.effective)) : undefined,
    onsetAt: text(info.onset) ? new Date(text(info.onset)) : undefined, expiresAt: expires ? new Date(expires) : undefined,
    areaDescription, references: text(info.web) ? [text(info.web)] : [], rawPayload: document,
  };
};

const normalizeSeverity = (severity) => {
  const value = String(severity || '').toLowerCase();
  if (value.includes('extreme') || value.includes('critical')) return 'Critical';
  if (value.includes('severe') || value.includes('high')) return 'High';
  if (value.includes('moderate') || value.includes('medium')) return 'Medium';
  return 'Low';
};

const normalizeType = (event) => {
  const value = String(event || '').toLowerCase();
  const types = [['flash flood', 'Flash Flood'], ['flood', 'Flood'], ['cyclone', 'Cyclone'], ['thunderstorm', 'Thunderstorm'], ['lightning', 'Lightning'], ['rain', 'Heavy Rain'], ['heat wave', 'Heat Wave'], ['cold wave', 'Cold Wave'], ['landslide', 'Landslide'], ['earthquake', 'Earthquake'], ['tsunami', 'Tsunami'], ['avalanche', 'Avalanche'], ['fire', 'Forest Fire'], ['drought', 'Drought'], ['dust storm', 'Dust Storm']];
  return types.find(([needle]) => value.includes(needle))?.[1] || event || 'Other';
};

const ingestCapAlert = async (xml, source = 'IMD_CAP') => {
  const parsed = parseCapAlert(xml, source);
  if (!parsed.externalAlertId) throw new Error('CAP alert identifier is missing');
  parsed.type = normalizeType(parsed.event);
  parsed.severity = normalizeSeverity(parsed.severity);
  parsed.updatedAt = new Date();
  return Alert.findOneAndUpdate({ externalAlertId: parsed.externalAlertId }, { $set: parsed, $setOnInsert: { createdAt: new Date() } }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
};

const fetchOfficialAlerts = async () => {
  const feedUrl = process.env.SACHET_CAP_FEED_URL || process.env.IMD_CAP_FEED_URL || DEFAULT_FEED_URL;
  const feedResponse = await requestWithRetry(feedUrl, { ...(feedEtag ? { 'If-None-Match': feedEtag } : {}), ...(feedLastModified ? { 'If-Modified-Since': feedLastModified } : {}), Accept: 'application/rss+xml, application/xml, text/xml' });
  if (feedResponse.status === 304) return { status: 304, alerts: [] };
  feedEtag = feedResponse.headers.etag || feedEtag;
  feedLastModified = feedResponse.headers['last-modified'] || feedLastModified;
  if (!String(feedResponse.headers['content-type'] || '').toLowerCase().includes('xml')) throw new Error(`Official feed returned non-XML content type: ${feedResponse.headers['content-type'] || 'unknown'}`);
  const feed = parser.parse(feedResponse.data);
  const items = asArray(feed.rss?.channel?.item || feed.feed?.entry);
  const alerts = [];
  for (const item of items) {
    const link = text(item.link?.['@_href'] || item.link);
    if (!link) continue;
    try {
      const response = await requestWithRetry(link, { Accept: 'application/xml, text/xml' });
      if (!String(response.headers['content-type'] || '').toLowerCase().includes('xml')) throw new Error(`CAP payload returned non-XML content type: ${response.headers['content-type'] || 'unknown'}`);
      alerts.push(await ingestCapAlert(response.data, process.env.SACHET_CAP_FEED_URL ? 'SACHET_CAP' : 'IMD_CAP'));
    } catch (error) { console.error(`[CAP] Failed to process item ${link}: ${error.message}`); }
  }
  return { status: 200, alerts };
};

const getActiveOfficialAlerts = async () => {
  const now = new Date();
  await Alert.updateMany({ source: { $in: ['IMD_CAP', 'SACHET_CAP'] }, expiresAt: { $lt: now }, status: 'Active' }, { $set: { status: 'Expired', updatedAt: now } });
  return Alert.find({ source: { $in: ['IMD_CAP', 'SACHET_CAP'] }, status: { $nin: ['Cancelled', 'Expired'] } }).sort({ sentAt: -1, createdAt: -1 }).lean();
};

module.exports = { fetchOfficialAlerts, ingestCapAlert, parseCapAlert, getActiveOfficialAlerts };
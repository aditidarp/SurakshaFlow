const crypto = require('crypto');

// Alert normalization utility - converts external API responses to standard format
const normalizeAlert = (alert, source) => {
  const location = buildLocation(alert);
  const createdAt = new Date(alert.date || alert.time || Date.now()).toISOString();
  const type = identifyType(alert);
  const severity = calculateSeverity(alert);
  const coordinates = extractCoordinates(alert);
  const id = alert.id || createStableId(source, alert.title, location, createdAt);

  return {
    id,
    title: alert.title || alert.name || alert.event || 'Disaster Alert',
    description: alert.description || alert.summary || alert.title || '',
    location,
    severity,
    type,
    source,
    external: source !== 'ADMIN',
    sourceData: alert,
    createdAt,
    url: alert.url || null,
    geometry: alert.geometry || null,
    coordinates,
  };
};

const buildLocation = (alert) => {
  if (typeof alert.location === 'string' && alert.location.trim().length > 0) {
    return alert.location;
  }

  if (alert.geometry?.coordinates && Array.isArray(alert.geometry.coordinates)) {
    const [lon, lat] = alert.geometry.coordinates;
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }

  if (alert.areas?.[0]?.name) {
    return alert.areas[0].name;
  }

  if (alert.place) {
    return alert.place;
  }

  return 'Unknown Location';
};

const extractCoordinates = (alert) => {
  const geometry = alert.geometry || alert.sourceData?.geometry;
  if (geometry?.type === 'Point' && Array.isArray(geometry.coordinates)) {
    const [lon, lat] = geometry.coordinates;
    return [lat, lon];
  }

  if (alert.coordinates && Array.isArray(alert.coordinates)) {
    return alert.coordinates;
  }

  return null;
};

const createStableId = (source, title, location, createdAt) => {
  const base = `${source}|${title}|${location}|${createdAt}`;
  return `${source}-${crypto.createHash('sha256').update(base).digest('hex').slice(0, 16)}`;
};

const identifyType = (alert) => {
  const text = (
    alert.category?.title ||
    alert.event ||
    alert.description ||
    alert.title ||
    ''
  ).toLowerCase();

  if (text.includes('flood') || text.includes('rain')) return 'Flood';
  if (text.includes('earthquake') || text.includes('seismic')) return 'Earthquake';
  if (text.includes('cyclone') || text.includes('hurricane') || text.includes('typhoon')) return 'Cyclone';
  if (text.includes('fire') || text.includes('wildfire')) return 'Fire';
  if (text.includes('landslide')) return 'Landslide';
  if (text.includes('volcanic') || text.includes('volcano')) return 'Volcano';
  if (text.includes('storm') || text.includes('thunder')) return 'Storm';
  if (text.includes('avalanche')) return 'Avalanche';
  if (text.includes('drought')) return 'Drought';
  if (text.includes('wind')) return 'Wind';

  return 'Disaster';
};

const calculateSeverity = (alert) => {
  if (alert.severity) {
    const sev = alert.severity.toLowerCase();
    if (sev.includes('extreme') || sev.includes('critical')) return 'Critical';
    if (sev.includes('severe') || sev.includes('high')) return 'High';
    if (sev.includes('moderate') || sev.includes('medium')) return 'Medium';
    return 'Low';
  }

  if (alert.properties?.mag) {
    const mag = alert.properties.mag;
    if (mag >= 7) return 'Critical';
    if (mag >= 6) return 'High';
    if (mag >= 5) return 'Medium';
    return 'Low';
  }

  if (alert.categories?.[0]?.title) {
    const category = alert.categories[0].title.toLowerCase();
    if (category.includes('drought') || category.includes('flood') || category.includes('severe')) return 'High';
    return 'Medium';
  }

  return 'Medium';
};

module.exports = {
  normalizeAlert,
  identifyType,
  calculateSeverity,
};

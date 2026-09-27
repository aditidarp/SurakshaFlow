const User = require('../models/User');
const { fetchOfficialAlerts } = require('./capAlertService');
const { sendBulkSMS, formatAlertMessage } = require('./smsService');
const { calculateDistanceKm } = require('../utils/geoUtils');

const safetyInstructions = {
  Flood: 'Move to higher ground immediately and avoid walking or driving through floodwaters.',
  Earthquake: 'Drop, cover, and hold on. Stay away from windows and unsecured objects.',
  Fire: 'Evacuate safely, avoid smoke, and call for help if trapped.',
  Cyclone: 'Stay indoors, secure loose objects, and avoid coastal areas.',
  Landslide: 'Move to safe ground away from slopes and unstable terrain.',
  Volcano: 'Stay inside, close windows, and follow official evacuation orders.',
  Storm: 'Stay indoors, keep emergency supplies ready, and avoid travel.',
  Disaster: 'Follow official guidance, stay alert, and seek shelter immediately.'
};

let lastAlertIds = new Set();
let pollInterval = null;

const getStableAlertId = (alert) => alert.externalAlertId || alert.id || String(alert._id);

const shouldSendSMS = (alert) => {
  const severity = (alert.severity || '').toLowerCase();
  return severity === 'critical' || severity === 'high' || alert.type === 'Earthquake' || alert.type === 'Fire';
};

const getAffectedUsers = async (alert) => {
  const filters = [{ optInSMS: true, role: { $ne: 'admin' } }];
  const locationText = (alert.location || '').toString().toLowerCase();

  let users = [];

  if (locationText) {
    users = await User.find({
      optInSMS: true,
      role: { $ne: 'admin' },
      $or: [
        { location: { $regex: locationText, $options: 'i' } },
        { state: { $regex: locationText, $options: 'i' } }
      ]
    }).select('_id name phone location state coordinates smsActivity');
  }

  if (users.length === 0 && alert.coordinates && alert.coordinates.length === 2) {
    const nearbyCandidates = await User.find({
      optInSMS: true,
      role: { $ne: 'admin' },
      'coordinates.lat': { $exists: true },
      'coordinates.lng': { $exists: true }
    }).select('_id name phone location state coordinates smsActivity');

    users = nearbyCandidates.filter((user) => {
      const distance = calculateDistanceKm(
        user.coordinates.lat,
        user.coordinates.lng,
        alert.coordinates[0],
        alert.coordinates[1]
      );
      return distance <= 200;
    });
  }

  if (users.length === 0) {
    users = await User.find({
      optInSMS: true,
      role: { $ne: 'admin' }
    }).select('_id name phone location state coordinates smsActivity');
  }

  return users;
};

const buildAlertSMS = (alert) => {
  const instruction = safetyInstructions[alert.type] || safetyInstructions.Disaster;
  return formatAlertMessage({
    type: alert.type || 'Disaster',
    location: alert.location || 'your area',
    severity: alert.severity || 'Medium',
    message: `${alert.title || alert.description || 'Please stay alert.'} ${instruction} Reply HELP for assistance.`
  });
};

const initializeExternalAlertMonitor = (io, seconds = 60) => {
  if (!io) {
    throw new Error('Socket.io instance is required to initialize the external alert monitor.');
  }

  const poll = async () => {
    try {
      const result = await fetchOfficialAlerts();
      if (result.status === 304) return;
      const alerts = result.alerts.filter((alert) => alert.status === 'Active');
      if (!Array.isArray(alerts) || alerts.length === 0) {
        return;
      }

      const newAlerts = alerts.filter((alert) => {
        const id = getStableAlertId(alert);
        if (lastAlertIds.has(id)) return false;
        alert.id = id;
        return true;
      });

      if (newAlerts.length > 0) {
        newAlerts.forEach(async (alert) => {
          io.emit('externalAlert', alert);
          io.emit('live-alert', alert);

          if (shouldSendSMS(alert)) {
            const users = await getAffectedUsers(alert);
            if (users.length > 0) {
              const message = buildAlertSMS(alert);
              await sendBulkSMS(users, message);
              console.log(`[ExternalAlertMonitor] Sent SMS for ${alert.type} alert to ${users.length} users`);
            } else {
              console.log('[ExternalAlertMonitor] No affected SMS users found for external alert.');
            }
          }
        });
      }

      lastAlertIds = new Set(alerts.map((alert) => getStableAlertId(alert)));
    } catch (error) {
      console.error('[ExternalAlertMonitor] Poll failed:', error.message);
    }
  };

  if (pollInterval) {
    clearInterval(pollInterval);
  }

  poll();
  pollInterval = setInterval(poll, seconds * 1000);
  console.log(`[ExternalAlertMonitor] Initialized, polling every ${seconds} seconds.`);
};

module.exports = {
  initializeExternalAlertMonitor,
};

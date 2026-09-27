const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Alert = require('../models/Alert');

// POST /api/admin/alert
// Protected: admin only
router.post('/alert', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can send alerts' });
    }

    const { type, lat, lon, message, severity, title } = req.body;
    if (!type || !lat || !lon || !message) {
      return res.status(400).json({ message: 'type, lat, lon, and message are required' });
    }

    const alertData = {
      title: title || `${type.toUpperCase()} Alert`,
      description: message,
      type,
      location: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
      severity: severity || 'High',
      date: new Date(),
      createdBy: req.user.id,
    };

    // Save alert to DB (non-blocking for emit; await so client sees persisted id)
    const alert = new Alert({
      title: alertData.title,
      description: alertData.description,
      type: alertData.type,
      location: { type: 'Point', coordinates: alertData.location.coordinates },
      severity: alertData.severity,
      createdBy: alertData.createdBy,
    });

    await alert.save();

    // Emit via socket.io to all connected clients
    const io = req.app.get('io');
    const payload = {
      id: alert._id,
      title: alert.title,
      description: alert.description,
      type: alert.type,
      location: alert.location,
      severity: alert.severity,
      createdAt: alert.createdAt || new Date().toISOString(),
    };

    if (io) {
      io.emit('liveAlert', payload);
      // also emit legacy event name for compatibility
      io.emit('live-alert', payload);
    }

    res.status(201).json({ message: 'Alert sent', alert: payload });
  } catch (err) {
    console.error('admin alert error', err);
    res.status(500).json({ message: 'Failed to send alert' });
  }
});

module.exports = router;

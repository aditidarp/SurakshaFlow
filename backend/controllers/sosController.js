const SOSRequest = require('../models/SOSRequest');
const RescueTeam = require('../models/RescueTeam');
const notification = require('../services/notificationService');

// Create SOS request (public)
exports.createSOS = async (req, res) => {
  try {
    const { name, phone, message, lat, lon, disasterType, peopleAffected, urgency } = req.body;
    if (!lat || !lon) return res.status(400).json({ message: 'lat & lon required' });

    const sos = new SOSRequest({
      user: req.user?.id,
      name,
      phone,
      message,
      disasterType,
      peopleAffected,
      urgency: urgency || 'MEDIUM',
      location: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
    });

    await sos.save();

    // notify nearby rescue teams (mock)
    notification.notify({ type: 'sos', sos });

    res.status(201).json({ message: 'SOS created', sos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recent SOS requests (admin / rescue)
exports.listSOS = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const sos = await SOSRequest.find().sort({ createdAt: -1 }).limit(parseInt(limit, 10));
    res.json(sos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get nearby SOS for a rescue team (provide lat, lon, radius in meters)
exports.nearbySOS = async (req, res) => {
  try {
    const { lat, lon, radius = 5000 } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'lat & lon required' });

    const sos = await SOSRequest.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
          $maxDistance: parseInt(radius, 10),
        }
      },
      status: { $in: ['Pending','Assigned','In Progress'] }
    }).limit(100);

    res.json(sos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Direct emergency call with full backend tracking (public)
exports.directEmergencyCall = async (req, res) => {
  try {
    const { name, phone, message, lat, lon, disasterType, peopleAffected, urgency } = req.body;
    if (!lat || !lon) return res.status(400).json({ message: 'lat & lon required' });

    const sos = new SOSRequest({
      user: req.user?.id,
      name,
      phone,
      message,
      disasterType,
      peopleAffected,
      urgency: urgency || 'HIGH',
      location: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
      status: 'In Progress',
    });

    await sos.save();

    // Notify nearby rescue teams immediately
    notification.notify({ type: 'emergency', sos });

    res.status(201).json({ message: 'Emergency call registered', sos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

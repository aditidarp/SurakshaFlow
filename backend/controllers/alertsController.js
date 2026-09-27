const Alert = require("../models/Alert");

// Create new alert (Admin only)
exports.createAlert = async (req, res) => {
  try {
    const { title, description, type, location, severity, affectedArea, casualties } = req.body;

    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can create alerts" });
    }

    if (!title || !description || !location) {
      return res.status(400).json({ message: "title, description, and location are required" });
    }

    const alert = new Alert({
      title,
      description,
      type: type || 'General', // Default to 'General' if not provided
      location,
      severity: severity || 'Medium',
      affectedArea,
      casualties: casualties || 0,
      createdBy: req.user.id,
    });

    await alert.save();
    await alert.populate('createdBy', 'name email');

    // Emit Socket.io event to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('newAlert', alert);
      console.log('Socket.io newAlert emitted:', alert._id);
    }

    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all alerts (all logged in users)
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getLatestAlerts = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const alerts = await Alert.find({ status: { $nin: ['Cancelled', 'Expired'] } })
      .populate('createdBy', 'name email').sort({ sentAt: -1, createdAt: -1 }).limit(limit).lean();
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error fetching latest alerts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getActiveAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ status: { $in: ['Active', 'Pending', 'Assigned'] }, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] })
      .populate('createdBy', 'name email').sort({ sentAt: -1, createdAt: -1 }).limit(100).lean();
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error fetching active alerts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id).populate('createdBy', 'name email').lean();
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.status(200).json(alert);
  } catch (error) {
    console.error('Error fetching alert:', error);
    res.status(400).json({ message: 'Invalid alert id' });
  }
};

// Get nearby alerts based on location (all logged in users)
exports.getNearbyAlerts = async (req, res) => {
  try {
    const { lat, lon, radius = 50000 } = req.query; // default 50km
    if (!lat || !lon) return res.status(400).json({ message: 'lat & lon required' });

    const alerts = await Alert.find({
      coordinates: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
          $maxDistance: parseInt(radius, 10),
        }
      }
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(100);

    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error fetching nearby alerts:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update alert (Admin only)
exports.updateAlert = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can update alerts" });
    }

    const updatedAlert = await Alert.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!updatedAlert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    // Emit Socket.io event to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('updateAlert', updatedAlert);
      console.log('Socket.io updateAlert emitted:', updatedAlert._id);
    }

    res.status(200).json(updatedAlert);
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete alert (Admin only)
exports.deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete alerts" });
    }

    const deletedAlert = await Alert.findByIdAndDelete(id);
    
    if (!deletedAlert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    // Emit Socket.io event to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('deleteAlert', { id: deletedAlert._id });
      console.log('Socket.io deleteAlert emitted:', deletedAlert._id);
    }

    res.status(200).json({ message: "Alert deleted successfully", alertId: id });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Assign an alert to a rescue team (Admin only)
exports.assignAlert = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can assign alerts' });
    }

    const { id } = req.params;
    const { teamId } = req.body;

    if (!teamId) {
      return res.status(400).json({ message: 'teamId is required' });
    }

    const alert = await Alert.findById(id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    alert.assignedTo = teamId;
    alert.status = 'Assigned';
    alert.assignedAt = new Date();
    alert.updatedAt = new Date();

    const updatedAlert = await alert.save();
    await updatedAlert.populate('createdBy','name email');

    const io = req.app.get('io');
    if (io) {
      io.emit('updateAlert', updatedAlert);
    }

    return res.status(200).json(updatedAlert);
  } catch (error) {
    console.error('Error assigning alert:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update alert status (Admin or Rescue)
exports.updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['Pending', 'Assigned', 'Resolved'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `status is required and must be one of ${allowedStatuses.join(', ')}` });
    }

    const alert = await Alert.findById(id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    alert.status = status;
    if (status === 'Resolved') {
      alert.resolvedAt = new Date();
    }
    alert.updatedAt = new Date();

    const updatedAlert = await alert.save();
    await updatedAlert.populate('createdBy','name email');

    const io = req.app.get('io');
    if (io) {
      io.emit('updateAlert', updatedAlert);
    }

    return res.status(200).json(updatedAlert);
  } catch (error) {
    console.error('Error updating alert status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's alert history (all logged in users)
exports.getAlertHistory = async (req, res) => {
  try {
    // For regular users, return all alerts (they can see all alerts)
    // For admin, they can see all alerts too
    const alerts = await Alert.find()
      .populate("createdBy", "name email")
      .sort({ date: -1 })
      .limit(100); // Limit to prevent too much data

    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

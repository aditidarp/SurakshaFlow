const Alert = require("../models/Alert");

// Get all disasters with filtering
exports.getDisasters = async (req, res) => {
  try {
    const { type, state, severity } = req.query;
    let query = {};

    if (type) query.type = type;
    if (state) query.state = state;
    if (severity) query.severity = { $gte: parseInt(severity) };

    const disasters = await Alert.find(query).sort({ createdAt: -1 }).limit(100);
    res.status(200).json(disasters);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get disaster by ID
exports.getDisasterById = async (req, res) => {
  try {
    const disaster = await Alert.findById(req.params.id);
    if (!disaster) return res.status(404).json({ message: "Disaster not found" });
    res.status(200).json(disaster);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get disasters by state
exports.getDisastersByState = async (req, res) => {
  try {
    const { state } = req.params;
    const disasters = await Alert.find({ state }).sort({ createdAt: -1 });
    res.status(200).json(disasters);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get disasters by type
exports.getDisastersByType = async (req, res) => {
  try {
    const { type } = req.params;
    const disasters = await Alert.find({ type }).sort({ createdAt: -1 });
    res.status(200).json(disasters);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get disaster statistics
exports.getStatistics = async (req, res) => {
  try {
    const total = await Alert.countDocuments();
    const byType = await Alert.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);
    const bySeverity = await Alert.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } }
    ]);
    const byState = await Alert.aggregate([
      { $group: { _id: "$state", count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      totalAlerts: total,
      byType,
      bySeverity,
      byState
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Simulate live alert creation
exports.createDisaster = async (req, res) => {
  try {
    const { type, title, description, lat, lon, severity, district, state } = req.body;

    if (!type || !lat || !lon) {
      return res.status(400).json({ message: "type, lat, lon are required" });
    }

    const alert = new Alert({
      type,
      title: title || `${type} Alert`,
      description: description || `${type} detected in ${district || "region"}`,
      location: { type: "Point", coordinates: [parseFloat(lon), parseFloat(lat)] },
      severity: severity || 3,
      district: district || "Unknown",
      state: state || "Unknown",
      createdAt: new Date()
    });

    await alert.save();
    res.status(201).json({ message: "Alert created", alert });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

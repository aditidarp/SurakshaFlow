const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const alertsController = require("../controllers/alertsController");
const axios = require("axios");

// ==================== SIMPLE ALERT MANAGEMENT (No Auth Required) ====================
// For the AlertManagement component - simplified CRUD operations
const Alert = require("../models/Alert");

// Simple GET - all alerts (public)
router.get("/simple/all", async (req, res) => {
  try {
    const alerts = await Alert.find()
      .sort({ createdAt: -1 });
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Simple POST - create alert (no auth required)
router.post("/simple/create", async (req, res) => {
  try {
    return res.status(410).json({ message: "Manual alert creation has been disabled; alerts come from official sources." });
    /*
    */
    const { title, description, location, severity } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    // Normalize severity to match enum: ["Low", "Medium", "High", "Critical"]
    const severityMap = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'critical': 'Critical'
    };
    const normalizedSeverity = severityMap[(severity || 'medium').toLowerCase()] || 'Medium';

    const alert = new Alert({
      title,
      description,
      location: location || "Unknown",
      severity: normalizedSeverity,
      type: "General", // default type
      createdBy: null,
      casualties: 0
    });

    await alert.save();

    // Emit Socket.io event to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('newAlert', alert);
      console.log('Socket.io newAlert emitted from simple create:', alert._id);
    }

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Simple PUT - update alert (no auth required)
router.put("/simple/update/:id", async (req, res) => {
  try {
    return res.status(410).json({ message: "Official alerts are read-only." });
    /*
    */
    const { id } = req.params;
    const { title, description, location, severity } = req.body;

    const updatedAlert = await Alert.findByIdAndUpdate(
      id,
      { title, description, location, severity, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedAlert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    // Emit Socket.io event to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('updateAlert', updatedAlert);
      console.log('Socket.io updateAlert emitted from simple update:', updatedAlert._id);
    }

    res.status(200).json(updatedAlert);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Simple DELETE - delete alert (no auth required)
router.delete("/simple/delete/:id", async (req, res) => {
  try {
    return res.status(410).json({ message: "Official alerts are read-only." });
    /*
    */
    const { id } = req.params;

    const deletedAlert = await Alert.findByIdAndDelete(id);

    if (!deletedAlert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    // Emit Socket.io event to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('deleteAlert', { id: deletedAlert._id });
      console.log('Socket.io deleteAlert emitted from simple delete:', deletedAlert._id);
    }

    res.status(200).json({ message: "Alert deleted successfully", deletedAlert });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==================== STANDARD ALERT CRUD (Original - Auth Required) ====================
// CRUD for alerts
router.get("/", alertsController.getAlerts); // public - list all alerts
router.get("/latest", alertsController.getLatestAlerts);
router.get("/active", alertsController.getActiveAlerts);
router.get("/nearby", alertsController.getNearbyAlerts); // get nearby alerts based on location
router.get("/history", auth, alertsController.getAlertHistory); // protected - user's alert history
// Official alerts are read-only. Rescue response changes use /api/rescue/missions.
router.get("/:id", alertsController.getAlertById);

// Convenience endpoint: generate alerts from OpenWeather for a given city or coords
// Example: GET /api/alerts/weather?city=Aurangabad  OR  /api/alerts/weather?lat=19.8&lon=75.3
router.get("/weather", async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return res.status(500).json({ message: "OpenWeather API key not configured" });

    let url;
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    } else if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    } else {
      return res.status(400).json({ message: "Provide city or lat & lon" });
    }

    const response = await axios.get(url);
    const data = response.data;

    const alerts = [];
    // Use response coordinates if available
    const coords = data.coord || {};

    if (data.main?.temp > 40) {
      alerts.push({
        alert: "Heat Wave Alert",
        description: "Extreme temperature detected",
        lat: coords.lat || null,
        lng: coords.lon || null,
        temperature: data.main.temp,
        city: data.name,
      });
    }

    if (data.weather && data.weather[0]) {
      const w = data.weather[0].main;
      if ((w === "Rain" || w === "Thunderstorm") && data.main.humidity > 80) {
        alerts.push({ alert: "Flood Risk", description: "Heavy rain and high humidity", lat: coords.lat || null, lng: coords.lon || null });
      }
      if (data.wind && data.wind.speed > 20) {
        alerts.push({ alert: "Wind Storm", description: "High wind speeds detected", wind: data.wind.speed, lat: coords.lat || null, lng: coords.lon || null });
      }
    }

    res.json({ city: data.name, alerts });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch weather data", details: err.response?.data || err.message });
  }
});

// Optional ML-based alert generation endpoint (keeps existing functionality)
// This posts to an ML service and emits a `live-alert` event via socket.io
router.post("/send", async (req, res) => {
  const io = req.app.get("io");

  try {
    // Use rain prediction ML endpoint for disaster alerts
    const mlRes = await axios.post("http://localhost:8000/predict", req.body);

    const alert = {
      predicted_rainfall: mlRes.data.predicted_rainfall,
      alert_level: mlRes.data.alert,
      weather_input: req.body,
      time: new Date()
    };

    io.emit("live-alert", alert);
    res.json({ success: true, alert });
  } catch (err) {
    console.error('ML send error', err.message || err);
    res.status(500).json({ message: 'Failed to generate alert from ML service' });
  }
});

// ==================== AUTHENTICATED ALERT ROUTES (Admin/Authenticated Users) ====================

// GET /api/alerts - Get all alerts (authenticated users)
router.get("/", auth, alertsController.getAlerts);

// POST /api/alerts - Create new alert (admin only)
router.post("/", auth, alertsController.createAlert);

// PUT /api/alerts/:id - Update alert (admin only)
router.put("/:id", auth, alertsController.updateAlert);

// DELETE /api/alerts/:id - Delete alert (admin only)
router.delete("/:id", auth, alertsController.deleteAlert);

// PUT /api/alerts/:id/assign - Assign alert to rescue team (admin only)
router.put("/:id/assign", auth, alertsController.assignAlert);

// PUT /api/alerts/:id/status - Update alert status (admin or assigned rescue)
router.put("/:id/status", auth, alertsController.updateAlertStatus);

module.exports = router;

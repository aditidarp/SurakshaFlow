const express = require("express");
const router = express.Router();
const realAlertsController = require("../controllers/realAlertsController");

// Get combined alerts (admin + external)
router.get("/combined", realAlertsController.getCombinedAlerts);

// Get only external/real-world alerts
router.get("/external", realAlertsController.getExternalAlerts);
router.get("/active", realAlertsController.getExternalAlerts);

// Get weather alerts
router.get("/weather", realAlertsController.getWeatherAlerts);

// Get disaster alerts from NASA EONET
router.get("/disasters", realAlertsController.getDisasterAlerts);

// Get earthquake alerts from USGS
router.get("/earthquakes", realAlertsController.getEarthquakeAlerts);

// Search alerts with filters
router.get("/search", realAlertsController.searchAlerts);

// Get statistics
router.get("/stats", realAlertsController.getAlertStats);

module.exports = router;

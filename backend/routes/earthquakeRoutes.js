const express = require("express");
const router = express.Router();
const earthquakeController = require("../controllers/earthquakeController");

// Get all earthquakes
router.get("/", earthquakeController.getEarthquakes);

// Get recent earthquakes
router.get("/recent", earthquakeController.getRecentEarthquakes);

// Get earthquake by ID
router.get("/:id", earthquakeController.getEarthquakeDetails);

module.exports = router;

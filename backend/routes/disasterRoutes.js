const express = require("express");
const router = express.Router();
const disasterController = require("../controllers/disasterController");

// Get all disasters
router.get("/", disasterController.getDisasters);

// Get disaster statistics
router.get("/statistics", disasterController.getStatistics);

// Get disasters by state
router.get("/state/:state", disasterController.getDisastersByState);

// Get disasters by type
router.get("/type/:type", disasterController.getDisastersByType);

// Get disaster by ID
router.get("/:id", disasterController.getDisasterById);

// Create disaster (for demo/testing)
router.post("/", disasterController.createDisaster);

module.exports = router;

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const smsPreferencesController = require("../controllers/smsPreferencesController");

/**
 * SMS User Preferences Routes
 * All routes require authentication
 */

// Get user's current SMS preferences
router.get(
  "/",
  authMiddleware,
  smsPreferencesController.getUserPreferences
);

// Update entire preferences object
router.put(
  "/",
  authMiddleware,
  smsPreferencesController.updateUserPreferences
);

// Toggle specific disaster type alerts
router.post(
  "/toggle/:disasterType",
  authMiddleware,
  smsPreferencesController.toggleDisasterAlert
);

// Set quiet hours
router.post(
  "/quiet-hours",
  authMiddleware,
  smsPreferencesController.setQuietHours
);

// Set minimum severity level
router.post(
  "/severity",
  authMiddleware,
  smsPreferencesController.setMinimumSeverity
);

// Check if user is eligible for an alert (based on preferences)
router.post(
  "/check",
  authMiddleware,
  smsPreferencesController.checkAlertEligibility
);

// Get SMS activity statistics
router.get(
  "/activity",
  authMiddleware,
  smsPreferencesController.getActivityStats
);

module.exports = router;

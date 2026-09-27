const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const scheduledAlertController = require("../controllers/scheduledAlertController");

/**
 * Scheduled Alerts Routes
 * Most routes require admin authentication
 */

// Create new scheduled alert
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  scheduledAlertController.scheduleAlert
);

// Get all scheduled alerts with filters
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  scheduledAlertController.getScheduledAlerts
);

// Get alerting statistics
router.get(
  "/stats/overview",
  authMiddleware,
  roleMiddleware("admin"),
  scheduledAlertController.getAlertStats
);

// Get pending alerts (for scheduler)
router.get(
  "/pending",
  authMiddleware,
  roleMiddleware("admin"),
  scheduledAlertController.getPendingAlerts
);

// Get single scheduled alert
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  scheduledAlertController.getScheduledAlert
);

// Update scheduled alert
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  scheduledAlertController.updateScheduledAlert
);

// Cancel scheduled alert
router.post(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware("admin"),
  scheduledAlertController.cancelScheduledAlert
);

module.exports = router;

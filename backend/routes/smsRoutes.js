const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");
const {
  sendSMSAlert,
  getAlertHistory,
  getAlertDetails,
  getAlertStats,
  retryFailedSMS,
  makeVoiceCall,
} = require("../controllers/smsController");

// Rate limiters
const alertLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 alerts per hour per admin
  message:
    "Too many alerts sent from this account, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const historyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Routes for SMS Alert System
 */

// Send SMS Alert (Protected - Admin only, Rate limited)
router.post("/send", authMiddleware, alertLimiter, sendSMSAlert);

// Get Alert History (Protected, Rate limited)
router.get("/history", authMiddleware, historyLimiter, getAlertHistory);

// Get Alert Details (Protected)
router.get("/:alertId", authMiddleware, getAlertDetails);

// Get Alert Stats (Protected)
router.get("/:alertId/stats", authMiddleware, getAlertStats);

// Retry Failed SMS (Protected - Admin only)
router.post("/:alertId/retry-failed", authMiddleware, retryFailedSMS);

// Make Voice Call (Protected - Admin only, Rate limited)
router.post("/voice-call", authMiddleware, alertLimiter, makeVoiceCall);

// Emergency Voice Call (Public - for emergency buttons, rate limited)
router.post("/emergency-voice-call", alertLimiter, makeVoiceCall);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const notificationController = require('../controllers/notificationController');

// Admin-only endpoint to send SMS notifications
router.post('/sms', auth, role('admin'), notificationController.sendSMS);

module.exports = router;

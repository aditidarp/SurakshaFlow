const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');
const auth = require('../middleware/authMiddleware');
const { sosLimiter } = require('../middleware/rateLimiter');

// Public: create SOS (rate limited)
router.post('/', sosLimiter, sosController.createSOS);

// Public: Direct emergency call with full backend tracking (rate limited)
router.post('/direct-call', sosLimiter, sosController.directEmergencyCall);

// Protected: list all recent SOS (admin or rescue)
router.get('/', auth, sosController.listSOS);

// Protected: nearby sos for rescue teams
router.get('/nearby', auth, sosController.nearbySOS);

module.exports = router;

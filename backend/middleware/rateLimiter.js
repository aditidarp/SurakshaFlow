const rateLimit = require('express-rate-limit');

// Limit SOS creation to prevent abuse: e.g., 10 per hour per IP
const sosLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { message: 'Too many SOS requests from this IP, please try later.' },
});

module.exports = { sosLimiter };

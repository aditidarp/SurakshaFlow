const auth = require('./authMiddleware');

module.exports = [
  auth,
  (req, res, next) => {
    if (req.user?.role !== 'rescue_team') {
      return res.status(403).json({ message: 'Rescue team access required' });
    }
    next();
  },
];
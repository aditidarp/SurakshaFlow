// roleMiddleware(role) - ensures user has required role
module.exports = (requiredRole) => (req, res, next) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  if (requiredRole === 'any') return next();
  if (user.role !== requiredRole && user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
  next();
};

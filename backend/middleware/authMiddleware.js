const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next(new AppError('No token provided', 401));
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    // Passes JsonWebTokenError / TokenExpiredError to the global handler
    next(err);
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return next(new AppError('Access denied. Admins only.', 403));
  next();
};

module.exports = { auth, adminOnly };

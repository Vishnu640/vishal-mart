/**
 * AppError — throw this anywhere in a controller to send a
 * structured error response without a try/catch.
 *
 * Usage:  throw new AppError('Order not found', 404);
 */
class AppError extends Error {
  constructor(message, statusCode = 500, extras = {}) {
    super(message);
    this.statusCode = statusCode;
    this.extras = extras;
    this.isOperational = true; // distinguishes known errors from bugs
  }
}

/**
 * Global error handler — must be registered LAST in server.js.
 * Catches every error passed via next(err) or thrown in async routes.
 */
const errorHandler = (err, req, res, next) => {
  // Mongoose duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).json({ success: false, message });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
  }

  // Known operational errors thrown via AppError
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...err.extras,
    });
  }

  // Unknown / programmer errors — don't leak details in production
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
};

module.exports = { AppError, errorHandler };

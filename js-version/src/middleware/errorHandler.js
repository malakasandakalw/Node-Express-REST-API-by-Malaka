const config = require('../config');

// Custom operational error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // user-caused, safe to expose
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async wrapper — eliminates try/catch in every controller
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Handle specific Mongoose errors into readable messages
const handleMongooseError = (err) => {
  // Duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return new AppError(`${field} already exists.`, 409);
  }

  // Validation error (schema constraints)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return new AppError(messages.join('. '), 400);
  }

  // Invalid ObjectId
  if (err.name === 'CastError') {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  return err;
};

// Global error-handling middleware — must have 4 params
const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  // Transform Mongoose errors
  error = handleMongooseError(error);

  const statusCode = error.statusCode || 500;

  // Development: include full stack trace
  if (!config.isProduction) {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message: error.message || 'Internal Server Error',
      stack: err.stack,
    });
  }

  // Production: only expose operational errors to client
  if (error.isOperational) {
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Programming/unknown error — log it, send generic response
  console.error('UNEXPECTED ERROR:', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
  });
};

// 404 handler — for routes that don't exist
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

module.exports = { AppError, asyncHandler, errorHandler, notFound };

const jwt = require('jsonwebtoken');
const config = require('../config');
const { AppError } = require('./errorHandler');
const User = require('../models/User');

// Verify JWT and attach user to request
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    // Verify user still exists in DB
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return next(new AppError('User no longer exists.', 401));
    }

    req.user = user; // attach full user to request
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired. Please log in again.', 401));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    next(err);
  }
};

// Role-based authorization — call after authenticate
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new AppError(
        `Access denied. Required role: ${roles.join(' or ')}.`,
        403
      )
    );
  }
  next();
};

module.exports = { authenticate, authorize };

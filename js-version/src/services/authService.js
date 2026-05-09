const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// Generate signed JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

// Register new user
const register = async ({ name, email, password, role }) => {
  // Check if email already taken
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);

  return { user: user.toSafeObject(), token };
};

// Login existing user
const login = async ({ email, password }) => {
  // Must explicitly select password (it's excluded by default)
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    // Same generic message — don't reveal which field is wrong
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated.', 403);
  }

  const token = generateToken(user._id);
  return { user: user.toSafeObject(), token };
};

// Get user profile
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);
  return user.toSafeObject();
};

module.exports = { register, login, getProfile };

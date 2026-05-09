const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: { user, token },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    data: { user, token },
  });
});

// GET /api/auth/me  (protected)
const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

module.exports = { register, login, getProfile };

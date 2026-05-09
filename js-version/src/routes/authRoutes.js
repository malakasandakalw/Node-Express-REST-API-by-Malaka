const router = require('express').Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, registerSchema, loginSchema } = require('../middleware/validate');
const rateLimit = require('express-rate-limit');

// Strict rate limit for auth endpoints — prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
  skipSuccessfulRequests: true,
});

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login',    authLimiter, validate(loginSchema),    authController.login);
router.get('/me',        authenticate,                          authController.getProfile);

module.exports = router;

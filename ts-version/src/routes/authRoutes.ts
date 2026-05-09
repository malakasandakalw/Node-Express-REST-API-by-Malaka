import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate, registerSchema, loginSchema } from '../middleware/validate';

const router = Router();

// Strict rate limit for auth endpoints — prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
  skipSuccessfulRequests: true,
});

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login',    authLimiter, validate(loginSchema),    authController.login);
router.get('/me',        authenticate,                          authController.getProfile);

export default router;

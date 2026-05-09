import { Response } from 'express';
import * as authService from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

// POST /api/v1/auth/register
export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { user, token } = await authService.register(req.body);

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: { user, token },
  });
});

// POST /api/v1/auth/login
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { user, token } = await authService.login(req.body);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    data: { user, token },
  });
});

// GET /api/v1/auth/me  (protected)
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await authService.getProfile(req.user!._id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

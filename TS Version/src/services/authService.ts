import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import config from '../config';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthResult } from '../types';

const generateToken = (userId: Types.ObjectId): string => {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const register = async (data: {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}): Promise<AuthResult> => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const user = await User.create(data);
  const token = generateToken(user._id);

  return { user: user.toSafeObject(), token };
};

export const login = async (data: {
  email: string;
  password: string;
}): Promise<AuthResult> => {
  // Must explicitly select password (excluded by default)
  const user = await User.findOne({ email: data.email }).select('+password');

  if (!user || !(await user.comparePassword(data.password))) {
    // Same message for both — don't reveal which field is wrong
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated.', 403);
  }

  const token = generateToken(user._id);
  return { user: user.toSafeObject(), token };
};

export const getProfile = async (userId: Types.ObjectId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);
  return user.toSafeObject();
};

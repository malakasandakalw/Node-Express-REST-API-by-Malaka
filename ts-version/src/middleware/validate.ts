import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { AppError } from './errorHandler';

// Middleware factory — validates req.body against a Zod schema
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError(JSON.stringify(errors), 400));
    }
    req.body = result.data; // replace with sanitized data
    next();
  };
};

// ── Schemas ───────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50).trim(),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  role: z.enum(['user', 'admin']).default('user'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const createProductSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  description: z.string().min(10).max(1000).trim(),
  price: z.number().positive('Price must be a positive number'),
  category: z.enum(['electronics', 'clothing', 'food', 'books', 'other']),
  stock: z.number().int().min(0).default(0),
});

export const updateProductSchema = createProductSchema.partial();

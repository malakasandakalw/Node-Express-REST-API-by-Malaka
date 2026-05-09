const { z } = require('zod');
const { AppError } = require('./errorHandler');

// Middleware factory — validates req.body against a Zod schema
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return next(new AppError(JSON.stringify(errors), 400));
  }

  req.body = result.data; // replace body with sanitized/parsed data
  next();
};

// ── Schemas ──────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50).trim(),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['user', 'admin']).default('user'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const createProductSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  description: z.string().min(10).max(1000).trim(),
  price: z.number().positive('Price must be a positive number'),
  category: z.enum(['electronics', 'clothing', 'food', 'books', 'other']),
  stock: z.number().int().min(0).default(0),
});

const updateProductSchema = createProductSchema.partial(); // all fields optional

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createProductSchema,
  updateProductSchema,
};

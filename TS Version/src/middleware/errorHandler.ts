import { Request, Response, NextFunction } from 'express';
import config from '../config';

// Custom operational error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async wrapper — eliminates try/catch in every controller
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Transform Mongoose errors into readable AppErrors
const handleMongooseError = (err: any): AppError | any => {
  // Duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return new AppError(`${field} already exists.`, 409);
  }
  // Schema validation error
  if (err.name === 'ValidationError') {
    const messages: string[] = Object.values(err.errors).map(
      (e: any) => e.message
    );
    return new AppError(messages.join('. '), 400);
  }
  // Invalid ObjectId
  if (err.name === 'CastError') {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }
  return err;
};

// Global error-handling middleware — must have 4 params, registered last
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err, message: err.message };
  error = handleMongooseError(error);

  const statusCode: number = error.statusCode || 500;

  // Development: include full stack trace
  if (!config.isProduction) {
    res.status(statusCode).json({
      success: false,
      statusCode,
      message: error.message || 'Internal Server Error',
      stack: err.stack,
    });
    return;
  }

  // Production: only expose operational errors
  if (error.isOperational) {
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Unknown/programming error — log and send generic message
  console.error('UNEXPECTED ERROR:', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
  });
};

// 404 handler — registered after all routes
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

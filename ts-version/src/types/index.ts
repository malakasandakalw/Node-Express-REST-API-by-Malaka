import { Request } from 'express';
import { Document, Types } from 'mongoose';

// Extend Express Request to include authenticated user
export interface AuthRequest extends Request {
  user?: IUserDocument;
}

// User shape
export interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  isActive: boolean;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toSafeObject(): Omit<IUser, 'password'>;
}

// Product shape
export interface IProduct {
  name: string;
  description: string;
  price: number;
  category: 'electronics' | 'clothing' | 'food' | 'books' | 'other';
  stock: number;
  createdBy: Types.ObjectId;
}

export interface IProductDocument extends IProduct, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Query params for product listing
export interface ProductQuery {
  page?: string;
  limit?: string;
  sort?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
}

// Auth service return type
export interface AuthResult {
  user: Omit<IUser, 'password'>;
  token: string;
}

import mongoose, { Schema } from 'mongoose';
import { IProductDocument } from '../types';

const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['electronics', 'clothing', 'food', 'books', 'other'],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProductDocument>('Product', productSchema);

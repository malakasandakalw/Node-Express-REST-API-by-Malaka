import Product from '../models/Product';
import { AppError } from '../middleware/errorHandler';
import { IUserDocument, ProductQuery } from '../types';

export const getAllProducts = async (query: ProductQuery) => {
  const {
    page = '1',
    limit = '10',
    sort = '-createdAt',
    category,
    minPrice,
    maxPrice,
    search,
  } = query;

  const filter: Record<string, any> = {};

  if (category) filter.category = category;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (search) filter.$text = { $search: search };

  const pageNum  = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const skip     = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
    },
  };
};

export const getProductById = async (id: string) => {
  const product = await Product.findById(id).populate('createdBy', 'name email');
  if (!product) throw new AppError('Product not found.', 404);
  return product;
};

export const createProduct = async (data: any, userId: any) => {
  return await Product.create({ ...data, createdBy: userId });
};

export const updateProduct = async (
  id: string,
  data: any,
  user: IUserDocument
) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Product not found.', 404);

  const isOwner = product.createdBy.toString() === user._id.toString();
  if (!isOwner && user.role !== 'admin') {
    throw new AppError('You do not have permission to update this product.', 403);
  }

  return await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteProduct = async (id: string, user: IUserDocument) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Product not found.', 404);

  const isOwner = product.createdBy.toString() === user._id.toString();
  if (!isOwner && user.role !== 'admin') {
    throw new AppError('You do not have permission to delete this product.', 403);
  }

  await product.deleteOne();
};

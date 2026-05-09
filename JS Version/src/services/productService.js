const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');

// Get all products with filtering, sorting, pagination
const getAllProducts = async (query) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    category,
    minPrice,
    maxPrice,
    search,
  } = query;

  const filter = {};

  if (category) filter.category = category;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

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

// Get single product by ID
const getProductById = async (id) => {
  const product = await Product.findById(id).populate('createdBy', 'name email');
  if (!product) throw new AppError('Product not found.', 404);
  return product;
};

// Create new product
const createProduct = async (data, userId) => {
  const product = await Product.create({ ...data, createdBy: userId });
  return product;
};

// Update product — only owner or admin
const updateProduct = async (id, data, user) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Product not found.', 404);

  // Only the creator or an admin can update
  const isOwner = product.createdBy.toString() === user._id.toString();
  if (!isOwner && user.role !== 'admin') {
    throw new AppError('You do not have permission to update this product.', 403);
  }

  const updated = await Product.findByIdAndUpdate(id, data, {
    new: true,           // return updated document
    runValidators: true, // run schema validators on update
  });

  return updated;
};

// Delete product — only owner or admin
const deleteProduct = async (id, user) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Product not found.', 404);

  const isOwner = product.createdBy.toString() === user._id.toString();
  if (!isOwner && user.role !== 'admin') {
    throw new AppError('You do not have permission to delete this product.', 403);
  }

  await product.deleteOne();
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

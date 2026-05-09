const productService = require('../services/productService');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/products
const getAllProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.query);

  res.status(200).json({
    success: true,
    data: result.products,
    pagination: result.pagination,
  });
});

// GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  res.status(200).json({
    success: true,
    data: product,
  });
});

// POST /api/products  (protected)
const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: 'Product created successfully.',
    data: product,
  });
});

// PUT /api/products/:id  (protected)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(
    req.params.id,
    req.body,
    req.user
  );

  res.status(200).json({
    success: true,
    message: 'Product updated successfully.',
    data: product,
  });
});

// DELETE /api/products/:id  (protected)
const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully.',
  });
});

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};

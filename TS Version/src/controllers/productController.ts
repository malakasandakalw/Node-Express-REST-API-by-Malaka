import { Response } from 'express';
import * as productService from '../services/productService';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest, ProductQuery } from '../types';

// GET /api/v1/products
export const getAllProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await productService.getAllProducts(req.query as ProductQuery);

  res.status(200).json({
    success: true,
    data: result.products,
    pagination: result.pagination,
  });
});

// GET /api/v1/products/:id
export const getProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await productService.getProductById(req.params.id);

  res.status(200).json({
    success: true,
    data: product,
  });
});

// POST /api/v1/products  (protected)
export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await productService.createProduct(req.body, req.user!._id);

  res.status(201).json({
    success: true,
    message: 'Product created successfully.',
    data: product,
  });
});

// PUT /api/v1/products/:id  (protected)
export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await productService.updateProduct(
    req.params.id,
    req.body,
    req.user!
  );

  res.status(200).json({
    success: true,
    message: 'Product updated successfully.',
    data: product,
  });
});

// DELETE /api/v1/products/:id  (protected)
export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  await productService.deleteProduct(req.params.id, req.user!);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully.',
  });
});

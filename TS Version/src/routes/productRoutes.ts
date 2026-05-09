import { Router } from 'express';
import * as productController from '../controllers/productController';
import { authenticate } from '../middleware/auth';
import { validate, createProductSchema, updateProductSchema } from '../middleware/validate';

const router = Router();

// Public routes — no auth required
router.get('/',    productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Protected routes — must be logged in
router.use(authenticate);

router.post('/',    validate(createProductSchema), productController.createProduct);
router.put('/:id',  validate(updateProductSchema), productController.updateProduct);
router.delete('/:id',                              productController.deleteProduct);

export default router;

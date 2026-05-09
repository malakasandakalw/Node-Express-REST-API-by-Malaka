const router = require('express').Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validate,
  createProductSchema,
  updateProductSchema,
} = require('../middleware/validate');

// Public routes — no auth required
router.get('/',    productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Protected routes — must be logged in
router.use(authenticate);

router.post('/',    validate(createProductSchema), productController.createProduct);
router.put('/:id',  validate(updateProductSchema), productController.updateProduct);
router.delete('/:id',                              productController.deleteProduct);

// Admin-only example
// router.delete('/all', authorize('admin'), productController.deleteAll);

module.exports = router;

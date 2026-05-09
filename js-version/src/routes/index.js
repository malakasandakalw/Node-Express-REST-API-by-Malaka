const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/products', require('./productRoutes'));

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    author: 'Malaka Sandakal',
    github: 'https://github.com/malakasandakalw',
    linkedIn: 'https://www.linkedin.com/in/malakasandakal/',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

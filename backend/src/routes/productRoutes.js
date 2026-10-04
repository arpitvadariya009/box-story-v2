const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getClientCatalogue,
  createOrUpdateCatalogue,
  getMyCatalogues,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const path = require('path');

router.use(protect);

// Client catalogue retrieval routes (Accessible by clients and admins)
router.get('/catalogue/client', getClientCatalogue);
router.get('/catalogue/my-catalogues', getMyCatalogues);
router.post('/catalogue/curate', authorize('SuperAdmin', 'Admin', 'BDM', 'CorporateHRManager'), createOrUpdateCatalogue);

// Image Upload Route
router.post(
  '/upload-image',
  authorize('SuperAdmin', 'Admin', 'DataEntryOperator'),
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename });
  }
);

// Base product catalogue routes
router
  .route('/')
  .get(getProducts)
  .post(authorize('SuperAdmin', 'Admin', 'DataEntryOperator'), createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(authorize('SuperAdmin', 'Admin'), updateProduct)
  .delete(authorize('SuperAdmin', 'Admin'), deleteProduct);

module.exports = router;

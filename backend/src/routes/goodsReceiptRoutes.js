const express = require('express');
const router = express.Router();
const {
  getGoodsReceipts,
  getGoodsReceiptById,
  createGoodsReceipt,
  inspectGoodsReceipt,
} = require('../controllers/goodsReceiptController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(authorize('SuperAdmin', 'Admin', 'Procurement', 'WarehouseLogistics'), getGoodsReceipts)
  .post(authorize('SuperAdmin', 'Admin', 'WarehouseLogistics'), createGoodsReceipt);

router.route('/:id').get(getGoodsReceiptById);
router.put('/:id/inspect', authorize('SuperAdmin', 'Admin', 'Procurement'), inspectGoodsReceipt);

module.exports = router;

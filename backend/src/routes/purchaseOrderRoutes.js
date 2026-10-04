const express = require('express');
const router = express.Router();
const {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  approvePurchaseOrder,
  updatePOStatus,
} = require('../controllers/purchaseOrderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(authorize('SuperAdmin', 'Admin', 'Procurement'), getPurchaseOrders)
  .post(authorize('SuperAdmin', 'Admin', 'Procurement'), createPurchaseOrder);

router.route('/:id').get(authorize('SuperAdmin', 'Admin', 'Procurement'), getPurchaseOrderById);
router.put('/:id/approve', authorize('SuperAdmin', 'Admin'), approvePurchaseOrder);
router.put('/:id/status', authorize('SuperAdmin', 'Admin', 'Procurement'), updatePOStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getOrderStats,
  assignDesign,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Analytics route
router.get('/stats/summary', authorize('SuperAdmin', 'Admin', 'Procurement', 'AccountsTeam'), getOrderStats);

// Base order routes
router
  .route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrderById)
  .put(authorize('SuperAdmin', 'Admin'), updateOrder)
  .delete(authorize('SuperAdmin', 'Admin'), deleteOrder);

router.put('/:id/status', updateOrderStatus);
router.put('/:id/assign-design', authorize('SuperAdmin', 'Admin'), assignDesign);

module.exports = router;


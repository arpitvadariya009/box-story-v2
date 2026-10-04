const express = require('express');
const router = express.Router();
const {
  getInventory,
  adjustStock,
  updateInventory,
  deleteInventory,
  getInventoryStats,
  getStockLedger,
  getStockMovements,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('SuperAdmin', 'Admin', 'Procurement', 'WarehouseLogistics', 'Dispatch'), getInventory);
router.post('/adjust', authorize('SuperAdmin', 'Admin', 'Procurement', 'WarehouseLogistics'), adjustStock);
router.get('/stats', authorize('SuperAdmin', 'Admin', 'Procurement', 'WarehouseLogistics'), getInventoryStats);
router.get('/ledger', authorize('SuperAdmin', 'Admin', 'Procurement', 'WarehouseLogistics'), getStockLedger);
router.get('/stock-movements', authorize('SuperAdmin', 'Admin', 'Procurement', 'WarehouseLogistics'), getStockMovements);

router.route('/:id')
  .put(authorize('SuperAdmin', 'Admin', 'Procurement', 'WarehouseLogistics'), updateInventory)
  .delete(authorize('SuperAdmin', 'Admin', 'Procurement'), deleteInventory);

module.exports = router;


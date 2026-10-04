const express = require('express');
const router = express.Router();
const {
  getPickLists,
  startPickList,
  completePickList,
  getPackingSlips,
  verifyPackingSlip,
  getDispatches,
  shipDispatch,
  getExceptions,
  resolveException,
  createDispatch,
} = require('../controllers/warehouseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('SuperAdmin', 'Admin', 'WarehouseLogistics'));

// Pick Lists
router.get('/pick-lists', getPickLists);
router.put('/pick-lists/:id/start', startPickList);
router.put('/pick-lists/:id/complete', completePickList);

// Packing
router.get('/packing', getPackingSlips);
router.put('/packing/:id/verify', verifyPackingSlip);

// Dispatches
router.get('/dispatches', getDispatches);
router.post('/dispatches', createDispatch);
router.put('/dispatches/:id/ship', shipDispatch);

// Exceptions
router.get('/exceptions', getExceptions);
router.put('/exceptions/:id/resolve', resolveException);

module.exports = router;

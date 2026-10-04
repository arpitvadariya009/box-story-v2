const express = require('express');
const router = express.Router();
const { getEWayBills, generateEWayBill } = require('../controllers/ewayBillController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('SuperAdmin', 'Admin', 'AccountsTeam', 'WarehouseLogistics'), getEWayBills)
  .post(authorize('SuperAdmin', 'Admin', 'AccountsTeam'), generateEWayBill);

module.exports = router;

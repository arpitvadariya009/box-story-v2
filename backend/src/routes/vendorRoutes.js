const express = require('express');
const router = express.Router();
const {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('SuperAdmin', 'Admin', 'Procurement', 'AccountsTeam', 'Finance'));

router.route('/')
  .get(getVendors)
  .post(authorize('SuperAdmin', 'Admin', 'Procurement', 'AccountsTeam'), createVendor);

router.route('/:id')
  .put(authorize('SuperAdmin', 'Admin', 'Procurement', 'AccountsTeam'), updateVendor)
  .delete(authorize('SuperAdmin', 'Admin', 'Procurement'), deleteVendor);

module.exports = router;

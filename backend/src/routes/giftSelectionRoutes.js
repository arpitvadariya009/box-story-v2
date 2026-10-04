const express = require('express');
const router = express.Router();
const {
  getGiftSelections,
  getGiftSelectionById,
  submitGiftSelection,
  approveGiftSelection,
  convertSelectionsToOrder,
} = require('../controllers/giftSelectionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getGiftSelections)
  .post(authorize('SuperAdmin', 'Admin', 'Employee'), submitGiftSelection);

router.post('/order', authorize('SuperAdmin', 'Admin', 'CorporateHRManager'), convertSelectionsToOrder);

router.route('/:id')
  .get(getGiftSelectionById);

router.put('/:id/approve', authorize('SuperAdmin', 'Admin', 'CorporateHRManager'), approveGiftSelection);

module.exports = router;

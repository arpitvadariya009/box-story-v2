const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  recordPayment,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getInvoices)
  .post(authorize('SuperAdmin', 'Admin', 'AccountsTeam', 'Finance', 'WarehouseLogistics'), createInvoice);

router.route('/:id')
  .get(getInvoiceById)
  .put(authorize('SuperAdmin', 'Admin', 'AccountsTeam', 'Finance'), updateInvoice)
  .delete(authorize('SuperAdmin', 'Admin'), deleteInvoice);

router.post('/:id/payments', authorize('SuperAdmin', 'Admin', 'AccountsTeam', 'Finance'), recordPayment);

module.exports = router;

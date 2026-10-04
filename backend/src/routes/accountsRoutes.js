const express = require('express');
const router = express.Router();
const {
  getAccountsDashboard,
  getClientInvoices,
  createClientInvoice,
  recordClientPayment,
  getReceivables,
  getVendorPayables,
  releaseVendorPayment,
  getVendorRegistrations,
  addVendorRegistration,
  getAccountsEWayBills,
  getFinancialReports,
} = require('../controllers/accountsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All accounts routes require authentication & AccountsTeam or Admin role
router.use(protect);
router.use(authorize('SuperAdmin', 'Admin', 'AccountsTeam'));

// ── Dashboard ──────────────────────────────────────────────────────────────
router.get('/dashboard', getAccountsDashboard);

// ── Client Invoicing ───────────────────────────────────────────────────────
router.get('/invoices', getClientInvoices);
router.post('/invoices', createClientInvoice);
router.post('/invoices/:id/record-payment', recordClientPayment);

// ── Receivables ────────────────────────────────────────────────────────────
router.get('/receivables', getReceivables);

// ── Vendor Payables ────────────────────────────────────────────────────────
router.get('/payables', getVendorPayables);
router.post('/payables/release', releaseVendorPayment);

// ── Vendor Registration ────────────────────────────────────────────────────
router.get('/vendor-registration', getVendorRegistrations);
router.post('/vendor-registration', addVendorRegistration);

// ── e-Way Bills ────────────────────────────────────────────────────────────
router.get('/eway-bills', getAccountsEWayBills);

// ── Financial Reports ──────────────────────────────────────────────────────
router.get('/reports', getFinancialReports);

module.exports = router;

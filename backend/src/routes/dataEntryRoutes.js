const express = require('express');
const router = express.Router();
const {
  getDataEntryDashboard,
  getSubmissions,
  getSubmissionById,
  submitProductEntry,
  submitInventoryEntry,
  submitOrderEntry,
  resubmitEntry,
  getPurchaseOrdersList,
  getClientsList,
  getVendorsList,
  getProductsList,
  getBinLocations,
} = require('../controllers/dataEntryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication and DataEntryOperator (or Admin) role
router.use(protect);
router.use(authorize('SuperAdmin', 'Admin', 'DataEntryOperator'));

// ── Dashboard ──────────────────────────────────────────────────────────────
router.get('/dashboard', getDataEntryDashboard);

// ── Lookup lists ───────────────────────────────────────────────────────────
router.get('/purchase-orders', getPurchaseOrdersList);
router.get('/clients', getClientsList);
router.get('/vendors', getVendorsList);
router.get('/products-list', getProductsList);
router.get('/bin-locations', getBinLocations);

// ── Submissions ────────────────────────────────────────────────────────────
router.get('/submissions', getSubmissions);
router.get('/submissions/:id', getSubmissionById);
router.put('/submissions/:auditId/resubmit', resubmitEntry);

// ── Data Entry Endpoints ───────────────────────────────────────────────────
router.post('/products', submitProductEntry);
router.post('/inventory', submitInventoryEntry);
router.post('/orders', submitOrderEntry);

module.exports = router;

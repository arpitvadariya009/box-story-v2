const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// GET /api/settings is open to all authenticated users (needed for logo & app configuration)
// PUT /api/settings is restricted to SuperAdmin and Admin
router.route('/')
  .get(getSettings)
  .put(authorize('SuperAdmin', 'Admin'), updateSettings);

module.exports = router;

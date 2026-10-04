const express = require('express');
const router = express.Router();
const { getReports, generateReport, getReportAnalytics } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/analytics', getReportAnalytics);

router.route('/')
  .get(getReports)
  .post(generateReport);

module.exports = router;


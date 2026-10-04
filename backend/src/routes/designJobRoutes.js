const express = require('express');
const router = express.Router();
const {
  getDesignJobs,
  getDesignJobById,
  uploadDesignProof,
  reviewDesignProof,
} = require('../controllers/designJobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('SuperAdmin', 'Admin', 'DesignCustomisation'), getDesignJobs);

router.route('/:id')
  .get(getDesignJobById);

router.post('/:id/proofs', authorize('SuperAdmin', 'Admin', 'DesignCustomisation'), uploadDesignProof);
router.put('/:id/proofs/:proofId', authorize('SuperAdmin', 'Admin', 'CorporateHRManager', 'Employee'), reviewDesignProof);

module.exports = router;

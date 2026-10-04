const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('SuperAdmin', 'Admin', 'BDM'), getClients)
  .post(authorize('SuperAdmin', 'Admin', 'BDM'), createClient);

router.route('/:id')
  .get(getClientById)
  .put(updateClient)
  .delete(authorize('SuperAdmin', 'Admin'), deleteClient);

module.exports = router;

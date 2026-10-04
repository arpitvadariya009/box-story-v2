const express = require('express');
const router = express.Router();
const {
  getCommunications,
  sendCommunication,
  markAsRead,
} = require('../controllers/communicationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getCommunications)
  .post(sendCommunication);

router.put('/:id/read', markAsRead);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getNotifications,
  createNotification,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getNotifications)
  .post(createNotification);

router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);

router.route('/:id')
  .delete(deleteNotification);

router.put('/:id/read', markAsRead);

module.exports = router;

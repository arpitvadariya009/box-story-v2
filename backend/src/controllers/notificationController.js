const Notification = require('../models/Notification');

// @desc    Get current user notifications (with optional pagination)
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const query = { recipient: req.user._id };
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      const skip = (page - 1) * limit;
      const total = await Notification.countDocuments(query);
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.json({
        notifications,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      });
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new notification & emit Socket event
// @route   POST /api/notifications
// @access  Private
const createNotification = async (req, res, next) => {
  try {
    const { recipient, title, message, type, priority, relatedModel, relatedId } = req.body;

    const notification = await Notification.create({
      recipient: recipient || req.user._id,
      sender: req.user._id,
      title,
      message,
      type: type || 'General',
      priority: priority || 'Normal',
      relatedModel: relatedModel || null,
      relatedId: relatedId || null,
    });

    // Real-time Socket.IO emission
    const io = req.app.get('io');
    if (io) {
      const recipientRoom = `user_${notification.recipient}`;
      io.to(recipientRoom).to('superadmin').to('admin').emit('new_notification', notification);
    }

    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ unreadCount: count });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    const updated = await notification.save();

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
      await Notification.deleteOne({ _id: req.params.id });
    }
    res.json({ message: 'Notification removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  createNotification,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

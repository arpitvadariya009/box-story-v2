const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: [
        'OrderUpdate',
        'InventoryAlert',
        'DesignProof',
        'ApprovalRequired',
        'GiftSelection',
        'PaymentReceived',
        'DispatchUpdate',
        'PurchaseOrder',
        'SystemAlert',
        'General',
      ],
      default: 'General',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedModel: {
      type: String,
      enum: ['Order', 'Invoice', 'DesignJob', 'PurchaseOrder', 'GiftSelection', 'Dispatch', 'PickList', 'GoodsReceipt', null],
      default: null,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ['Low', 'Normal', 'High', 'Critical'],
      default: 'Normal',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        customizationDetails: {
          brandingType: String,
          logo: String,
          colors: [String],
          designProof: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DesignJob',
          },
          notes: String,
        },
      },
    ],
    subtotal: Number,
    tax: Number,
    shippingCost: Number,
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'Draft',
        'Pending Approval',
        'Approved',
        'In Design',
        'Design Approved',
        'In Production',
        'Quality Check',
        'Ready to Pack',
        'Packed',
        'Ready to Ship',
        'Dispatched',
        'In Transit',
        'Delivered',
        'Cancelled',
        'Returned',
      ],
      default: 'Pending Approval',
    },
    priority: {
      type: String,
      enum: ['Normal', 'Urgent', 'Critical'],
      default: 'Normal',
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    trackingDetails: {
      carrier: String,
      trackingNumber: String,
      awbNumber: String,
      dispatchedAt: Date,
      deliveredAt: Date,
    },
    expectedDeliveryDate: {
      type: Date,
      default: null,
    },
    actualDeliveryDate: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    assignedDesigner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: [
      {
        message: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    giftMessage: {
      type: String,
      default: '',
    },
    giftPersonalization: {
      type: String,
      default: '',
    },
    giftSelection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GiftSelection',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// High-performance indexes for fast listing & filtering
orderSchema.index({ createdAt: -1 });
orderSchema.index({ client: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

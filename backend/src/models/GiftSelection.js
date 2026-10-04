const mongoose = require('mongoose');

const giftSelectionSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    catalogue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Catalogue',
      default: null,
    },
    selectedProducts: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        personalization: {
          type: String,
          default: '',
        },
      },
    ],
    budget: {
      type: Number,
      default: 0,
    },
    totalValue: {
      type: Number,
      default: 0,
    },
    occasion: {
      type: String,
      enum: ['Birthday', 'Anniversary', 'Festival', 'Welcome', 'Reward', 'Farewell', 'Other'],
      default: 'Other',
    },
    status: {
      type: String,
      enum: ['Pending', 'Submitted', 'Processed', 'Selected', 'Approved by HR', 'Approved', 'Ordered', 'Dispatched', 'Delivered', 'Rejected'],
      default: 'Pending',
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
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    giftMessage: {
      type: String,
      default: '',
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  },
  {
    timestamps: true,
  }
);

const GiftSelection = mongoose.model('GiftSelection', giftSelectionSchema);

module.exports = GiftSelection;

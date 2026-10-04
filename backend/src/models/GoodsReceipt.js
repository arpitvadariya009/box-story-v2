const mongoose = require('mongoose');

const goodsReceiptSchema = new mongoose.Schema(
  {
    grnNumber: {
      type: String,
      required: true,
      unique: true,
    },
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    receivedItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        orderedQty: {
          type: Number,
          required: true,
        },
        receivedQty: {
          type: Number,
          required: true,
        },
        acceptedQty: {
          type: Number,
          default: 0,
        },
        rejectedQty: {
          type: Number,
          default: 0,
        },
        reason: {
          type: String,
          default: '',
        },
      },
    ],
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending Inspection', 'Partially Accepted', 'Accepted', 'Rejected'],
      default: 'Pending Inspection',
    },
    receivedDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const GoodsReceipt = mongoose.model('GoodsReceipt', goodsReceiptSchema);

module.exports = GoodsReceipt;

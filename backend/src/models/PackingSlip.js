const mongoose = require('mongoose');

const packingSlipSchema = new mongoose.Schema(
  {
    packingNumber: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    pickList: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickList',
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
        boxNumber: {
          type: Number,
          default: 1,
        },
      },
    ],
    totalBoxes: {
      type: Number,
      default: 1,
    },
    totalWeight: {
      type: Number,
      default: 0,
    },
    packedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Packing', 'Packed', 'Verified'],
      default: 'Packing',
    },
  },
  {
    timestamps: true,
  }
);

const PackingSlip = mongoose.model('PackingSlip', packingSlipSchema);

module.exports = PackingSlip;

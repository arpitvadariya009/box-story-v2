const mongoose = require('mongoose');

const warehouseExceptionSchema = new mongoose.Schema(
  {
    exceptionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['Shortage', 'Damage', 'Wrong Item', 'Quality Issue', 'Missing', 'Other'],
      required: true,
    },
    relatedModel: {
      type: String,
      enum: ['Order', 'PickList', 'GoodsReceipt', 'Dispatch'],
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Open', 'Investigating', 'Resolved', 'Closed'],
      default: 'Open',
    },
    resolution: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const WarehouseException = mongoose.model('WarehouseException', warehouseExceptionSchema);

module.exports = WarehouseException;

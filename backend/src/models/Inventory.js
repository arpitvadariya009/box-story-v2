const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true,
    },
    availableQty: {
      type: Number,
      default: 0,
    },
    reservedQty: {
      type: Number,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      default: 10,
    },
    minStockLevel: {
      type: Number,
      default: 5,
    },
    maxStockLevel: {
      type: Number,
      default: 1000,
    },
    binLocation: {
      type: String,
      default: '',
    },
    warehouseLocation: {
      type: String,
      default: 'Main Warehouse',
    },
    zone: {
      type: String,
      default: '',
    },
    rack: {
      type: String,
      default: '',
    },
    shelf: {
      type: String,
      default: '',
    },
    batchNumber: {
      type: String,
      default: '',
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    lastAuditDate: {
      type: Date,
      default: null,
    },
    lastAuditBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    history: [
      {
        type: {
          type: String,
          enum: ['Inbound', 'Outbound', 'Adjustment'],
        },
        quantity: Number,
        reference: String,
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

inventorySchema.index({ availableQty: 1, reorderLevel: 1 });
inventorySchema.index({ warehouseLocation: 1, binLocation: 1 });
inventorySchema.index({ createdAt: -1 });

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;

const mongoose = require('mongoose');

const pickListSchema = new mongoose.Schema(
  {
    pickListNumber: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
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
        binLocation: {
          type: String,
          default: '',
        },
        pickedQty: {
          type: Number,
          default: 0,
        },
        status: {
          type: String,
          enum: ['Pending', 'Picked', 'Short', 'Substituted'],
          default: 'Pending',
        },
      },
    ],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Created', 'In Progress', 'Completed', 'Exception'],
      default: 'Created',
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const PickList = mongoose.model('PickList', pickListSchema);

module.exports = PickList;

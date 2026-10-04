const mongoose = require('mongoose');

const dispatchSchema = new mongoose.Schema(
  {
    dispatchNumber: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    packingSlip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PackingSlip',
      default: null,
    },
    carrier: {
      type: String,
      default: '',
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    awbNumber: {
      type: String,
      default: '',
    },
    vehicleNumber: {
      type: String,
      default: '',
    },
    driverName: {
      type: String,
      default: '',
    },
    driverPhone: {
      type: String,
      default: '',
    },
    eWayBillNumber: {
      type: String,
      default: '',
    },
    gatePassNumber: {
      type: String,
      default: '',
    },
    dispatchedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Ready for Pickup', 'Picked Up', 'In Transit', 'Delivered', 'Exception'],
      default: 'Pending',
    },
    estimatedDelivery: {
      type: Date,
      default: null,
    },
    actualDelivery: {
      type: Date,
      default: null,
    },
    proofOfDelivery: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Dispatch = mongoose.model('Dispatch', dispatchSchema);

module.exports = Dispatch;

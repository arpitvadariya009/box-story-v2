const mongoose = require('mongoose');

const eWayBillSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false,
      default: null,
    },
    dispatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispatch',
      default: null,
    },
    dispatchNumber: {
      type: String,
      default: '',
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      default: null,
    },
    fromAddress: {
      name: String,
      gstin: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    toAddress: {
      name: String,
      gstin: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    transporter: {
      type: String,
      default: '',
    },
    transporterId: {
      type: String,
      default: '',
    },
    vehicleNumber: {
      type: String,
      default: '',
    },
    documentType: {
      type: String,
      enum: ['Invoice', 'Bill', 'Delivery Challan', 'Credit Note', 'Other'],
      default: 'Invoice',
    },
    documentNumber: {
      type: String,
      default: '',
    },
    documentDate: {
      type: Date,
      default: Date.now,
    },
    totalValue: {
      type: Number,
      required: true,
    },
    hsnCode: {
      type: String,
      default: '',
    },
    distance: {
      type: Number,
      default: 0,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUpto: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Generated', 'Active', 'Expired', 'Cancelled'],
      default: 'Generated',
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const EWayBill = mongoose.model('EWayBill', eWayBillSchema);

module.exports = EWayBill;

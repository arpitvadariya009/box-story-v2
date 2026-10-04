const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    contactPerson: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    gstin: {
      type: String,
      default: '',
    },
    pan: {
      type: String,
      default: '',
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      ifsc: String,
      bank: String,
    },
    category: {
      type: String,
      enum: ['Manufacturer', 'Trader', 'Service Provider', 'Other'],
      default: 'Other',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    leadTimeDays: {
      type: Number,
      default: 7,
    },
    paymentTerms: {
      type: String,
      default: 'Net 30',
    },
    productsCount: {
      type: Number,
      default: 0,
    },
    documents: [
      {
        type: {
          type: String,
          enum: ['GST Certificate', 'PAN Card', 'Bank Proof', 'Agreement', 'Other'],
        },
        url: String,
        verified: {
          type: Boolean,
          default: false,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    suppliedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Pending Verification'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;

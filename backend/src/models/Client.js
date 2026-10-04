const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    logo: {
      type: String,
      default: '',
    },
    gstin: {
      type: String,
      default: '',
    },
    pan: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: '',
    },
    contractStartDate: {
      type: Date,
      default: null,
    },
    contractEndDate: {
      type: Date,
      default: null,
    },
    creditLimit: {
      type: Number,
      default: 0,
    },
    paymentTerms: {
      type: String,
      default: 'Net 30',
    },
    assignedBDM: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    employeeCount: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Pending', 'Draft'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

clientSchema.index({ status: 1, createdAt: -1 });
clientSchema.index({ assignedBDM: 1, createdAt: -1 });
clientSchema.index({ companyName: 'text', contactPerson: 'text', email: 'text', phone: 'text' });

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;

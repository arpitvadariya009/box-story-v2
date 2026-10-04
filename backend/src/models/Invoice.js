const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
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
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    invoiceType: {
      type: String,
      enum: ['Proforma', 'Tax Invoice', 'Credit Note', 'Debit Note'],
      default: 'Tax Invoice',
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: Date,
    amountDue: Number,
    subtotal: Number,
    gstin: {
      type: String,
      default: '',
    },
    placeOfSupply: {
      type: String,
      default: '',
    },
    reverseCharge: {
      type: Boolean,
      default: false,
    },
    cgst: {
      type: Number,
      default: 0,
    },
    sgst: {
      type: Number,
      default: 0,
    },
    igst: {
      type: Number,
      default: 0,
    },
    tds: {
      type: Number,
      default: 0,
    },
    totalTax: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      ifsc: String,
      bank: String,
    },
    eWayBillNumber: {
      type: String,
      default: '',
    },
    eWayBillDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Draft', 'Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled', 'Void'],
      default: 'Unpaid',
    },
    paymentHistory: [
      {
        amount: Number,
        paymentMethod: {
          type: String,
          enum: ['Bank Transfer', 'UPI', 'Cheque', 'Cash', 'Credit Card', 'Other'],
        },
        transactionId: String,
        paidAt: {
          type: Date,
          default: Date.now,
        },
        recordedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;

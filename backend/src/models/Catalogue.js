const mongoose = require('mongoose');

const catalogueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    theme: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Welcome Kit', 'Festival', 'Anniversary', 'Reward', 'Custom', 'General'],
      default: 'General',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        clientPrice: {
          type: Number,
          required: true,
        },
        qtyLimit: {
          type: Number,
          default: 50,
        },
        enabled: {
          type: Boolean,
          default: true,
        },
      },
    ],
    activeFrom: Date,
    activeTo: Date,
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    budget: {
      type: Number,
      default: 0,
    },
    employees: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Pending', 'Approved', 'Expired', 'Archived', 'Rejected'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Catalogue = mongoose.model('Catalogue', catalogueSchema);

module.exports = Catalogue;

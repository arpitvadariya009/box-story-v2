const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number,
    },
    brand: {
      type: String,
      default: '',
    },
    material: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
    minOrderQty: {
      type: Number,
      default: 1,
    },
    maxOrderQty: {
      type: Number,
      default: 10000,
    },
    leadTimeDays: {
      type: Number,
      default: 7,
    },
    isCustomizable: {
      type: Boolean,
      default: false,
    },
    customizationOptions: [
      {
        type: {
          type: String,
          enum: ['Logo Printing', 'Engraving', 'Custom Packaging', 'Label', 'Color Change'],
        },
        label: String,
        additionalCost: {
          type: Number,
          default: 0,
        },
      },
    ],
    tags: {
      type: [String],
      default: [],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
    },
    hsnCode: {
      type: String,
      default: '',
    },
    gstRate: {
      type: Number,
      default: 18,
    },
    status: {
      type: String,
      enum: ['Available', 'Active', 'Discontinued', 'Draft'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ category: 1, status: 1, createdAt: -1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ name: 'text', sku: 'text', brand: 'text', category: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

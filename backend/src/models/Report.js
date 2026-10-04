const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Sales', 'Inventory', 'Order', 'Finance', 'Procurement', 'Warehouse', 'Design', 'HR', 'Custom'],
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parameters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    fileUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Generating', 'Ready', 'Error'],
      default: 'Generating',
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;

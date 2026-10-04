const mongoose = require('mongoose');

const designJobSchema = new mongoose.Schema(
  {
    jobNumber: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: ['Logo Printing', 'Engraving', 'Custom Packaging', 'Label Design', 'Full Custom'],
      required: true,
    },
    specifications: {
      type: String,
      default: '',
    },
    brandGuidelines: {
      type: String,
      default: '',
    },
    proofs: [
      {
        version: {
          type: Number,
          required: true,
        },
        imageUrl: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ['Pending', 'Approved', 'Rejected'],
          default: 'Pending',
        },
        feedback: {
          type: String,
          default: '',
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null,
        },
        reviewedAt: {
          type: Date,
          default: null,
        },
      },
    ],
    status: {
      type: String,
      enum: [
        'Pending',
        'In Progress',
        'Proof Sent',
        'Revision Requested',
        'Approved',
        'In Production',
        'Completed',
      ],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Normal', 'High', 'Urgent'],
      default: 'Normal',
    },
    deadline: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const DesignJob = mongoose.model('DesignJob', designJobSchema);

module.exports = DesignJob;

const mongoose = require('mongoose');

const clientCommunicationSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    designJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DesignJob',
      default: null,
    },
    type: {
      type: String,
      enum: ['Design Proof', 'Feedback', 'Query', 'Update', 'General'],
      default: 'General',
    },
    subject: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: true,
    },
    attachments: {
      type: [String],
      default: [],
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    direction: {
      type: String,
      enum: ['Inbound', 'Outbound'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Sent', 'Read', 'Replied'],
      default: 'Sent',
    },
  },
  {
    timestamps: true,
  }
);

const ClientCommunication = mongoose.model('ClientCommunication', clientCommunicationSchema);

module.exports = ClientCommunication;

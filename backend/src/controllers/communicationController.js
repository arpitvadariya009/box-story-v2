const ClientCommunication = require('../models/ClientCommunication');

// @desc    Get client communications
// @route   GET /api/communications
// @access  Private
const getCommunications = async (req, res, next) => {
  try {
    let query = {};
    const { clientId, orderId, designJobId } = req.query;

    if (clientId) query.client = clientId;
    if (orderId) query.order = orderId;
    if (designJobId) query.designJob = designJobId;

    // Filter by client scope if Client HR/Employee
    if (['CorporateHRManager', 'Employee'].includes(req.user.role)) {
      query.client = req.user.client;
    }

    const communications = await ClientCommunication.find(query)
      .populate('client', 'companyName')
      .populate('sentBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(communications);
  } catch (error) {
    next(error);
  }
};

// @desc    Send communication/message to client or designer
// @route   POST /api/communications
// @access  Private
const sendCommunication = async (req, res, next) => {
  try {
    const { client, order, designJob, type, subject, message, attachments, direction } = req.body;

    const targetClient = ['CorporateHRManager', 'Employee'].includes(req.user.role) ? req.user.client : client;

    if (!targetClient) {
      res.status(400);
      throw new Error('Client parameter is required');
    }

    const comm = await ClientCommunication.create({
      client: targetClient,
      order: order || null,
      designJob: designJob || null,
      type: type || 'General',
      subject: subject || '',
      message,
      attachments: attachments || [],
      sentBy: req.user._id,
      direction: direction || (['CorporateHRManager', 'Employee'].includes(req.user.role) ? 'Inbound' : 'Outbound'),
      status: 'Sent',
    });

    res.status(201).json(comm);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark communication as read
// @route   PUT /api/communications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const comm = await ClientCommunication.findById(req.params.id);

    if (!comm) {
      res.status(404);
      throw new Error('Communication thread not found');
    }

    comm.status = 'Read';
    const updatedComm = await comm.save();
    res.json(updatedComm);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommunications,
  sendCommunication,
  markAsRead,
};

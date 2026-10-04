const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const Client = require('../models/Client');

// @desc    Get all invoices (with single-pass MongoDB aggregation pipeline & server-side pagination)
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const isPaginated = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;

    const { search, status, dateFrom, dateTo, from, to } = req.query;

    const baseMatch = {};

    if (req.user.role === 'ClientAdmin') {
      baseMatch.client = new mongoose.Types.ObjectId(req.user.client);
    }

    const fromDate = dateFrom || from;
    const toDate = dateTo || to;
    if (fromDate || toDate) {
      baseMatch.createdAt = {};
      if (fromDate) baseMatch.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        const d = new Date(toDate);
        d.setHours(23, 59, 59, 999);
        baseMatch.createdAt.$lte = d;
      }
    }

    const currentPage = isPaginated ? page : 1;
    const currentLimit = isPaginated ? limit : 1000;
    const skip = (currentPage - 1) * currentLimit;

    const pipeline = [
      { $match: baseMatch },
      {
        $lookup: {
          from: 'clients',
          localField: 'client',
          foreignField: '_id',
          as: 'client',
        },
      },
      {
        $unwind: {
          path: '$client',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'order',
          foreignField: '_id',
          as: 'order',
        },
      },
      {
        $unwind: {
          path: '$order',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (status && status !== 'All' && status !== 'All statuses') {
      pipeline.push({ $match: { status } });
    }

    if (search && search.trim()) {
      const sRegex = new RegExp(search.trim(), 'i');
      pipeline.push({
        $match: {
          $or: [
            { invoiceNumber: sRegex },
            { 'client.companyName': sRegex },
            { 'order.orderNumber': sRegex },
          ],
        },
      });
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        invoices: [
          { $sort: { createdAt: -1, _id: -1 } },
          { $skip: skip },
          { $limit: currentLimit },
        ],
        kpis: [
          {
            $group: {
              _id: null,
              totalInvoices: { $sum: 1 },
              paid: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0],
                },
              },
              pending: {
                $sum: {
                  $cond: [{ $in: ['$status', ['Pending', 'Unpaid', 'Partially Paid', 'Draft']] }, 1, 0],
                },
              },
              overdue: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Overdue'] }, 1, 0],
                },
              },
            },
          },
        ],
      },
    });

    const [result] = await Invoice.aggregate(pipeline);

    const total = result?.metadata?.[0]?.total || 0;
    const invoices = result?.invoices || [];
    const kpis = result?.kpis?.[0] || {
      totalInvoices: total,
      paid: 0,
      pending: 0,
      overdue: 0,
    };

    if (!isPaginated) {
      return res.json(invoices);
    }

    return res.json({
      invoices,
      data: invoices,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(total / currentLimit) || 1,
      kpis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client')
      .populate('order');

    if (!invoice) {
      res.status(404);
      throw new Error('Invoice not found');
    }

    if (req.user.role === 'ClientAdmin' && req.user.client.toString() !== invoice.client._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this invoice');
    }

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

// @desc    Record a payment and update invoice status
// @route   POST /api/invoices/:id/payments
// @access  Private/Finance
const recordPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod, transactionId } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      res.status(404);
      throw new Error('Invoice not found');
    }

    if (!['SuperAdmin', 'Admin', 'AccountsTeam'].includes(req.user.role)) {
      res.status(403);
      throw new Error('Only Finance or Admin can record payments');
    }

    const paymentAmount = Number(amount);
    
    // Add payment entry
    invoice.paymentHistory.push({
      amount: paymentAmount,
      paymentMethod,
      transactionId,
      paidAt: new Date(),
    });

    // Recalculate amount due
    invoice.amountDue = Math.max(0, invoice.amountDue - paymentAmount);

    // Update status based on remaining amount due
    if (invoice.amountDue === 0) {
      invoice.status = 'Paid';
    } else {
      invoice.status = 'Partially Paid';
    }

    const updatedInvoice = await invoice.save();
    res.json(updatedInvoice);
  } catch (error) {
    next(error);
  }
};

// @desc    Create invoice (Admin / Automations / Manual)
// @route   POST /api/invoices
// @access  Private/Admin
const createInvoice = async (req, res, next) => {
  try {
    const { orderId, orderReference, client, clientId, amount, subtotal: bodySubtotal, gstRate, totalAmount, dueDate, issueDate, notes, status } = req.body;

    let targetOrder = null;
    let targetClientId = client || clientId;

    // 1. Try finding order by orderId (ObjectId)
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      targetOrder = await Order.findById(orderId);
    }

    // 2. Try finding order by orderReference string (e.g. ORD-202609-0095)
    if (!targetOrder && orderReference && typeof orderReference === 'string' && orderReference.trim()) {
      targetOrder = await Order.findOne({
        orderNumber: { $regex: new RegExp(`^${orderReference.trim()}$`, 'i') },
      });
      if (!targetOrder && mongoose.Types.ObjectId.isValid(orderReference.trim())) {
        targetOrder = await Order.findById(orderReference.trim());
      }
    }

    // If order was found and client not explicitly provided, use order's client
    if (targetOrder && !targetClientId) {
      targetClientId = targetOrder.client;
    }

    if (!targetClientId) {
      res.status(400);
      throw new Error('Client is required to generate an invoice');
    }

    // Calculate billing amounts
    const baseSubtotal = Number(bodySubtotal) || Number(amount) || targetOrder?.subtotal || (targetOrder?.totalAmount ? targetOrder.totalAmount / 1.18 : 0);
    const parsedGstRate = parseInt(gstRate, 10) || (gstRate === 0 ? 0 : 18);
    const totalTax = baseSubtotal * (parsedGstRate / 100);
    const grandTotal = Number(totalAmount) || (baseSubtotal + totalTax) || targetOrder?.totalAmount || 0;
    const amountDue = grandTotal;

    const invoice = await Invoice.create({
      invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
      order: targetOrder?._id || null,
      client: targetClientId,
      subtotal: baseSubtotal,
      cgst: totalTax / 2,
      sgst: totalTax / 2,
      totalTax,
      grandTotal,
      amountDue,
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: status || 'Unpaid',
      notes: notes || '',
      generatedBy: req.user?._id || null,
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('client', 'companyName email phone address gstin')
      .populate('order', 'orderNumber totalAmount status');

    res.status(201).json(populatedInvoice);
  } catch (error) {
    next(error);
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private/Admin
const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      res.status(404);
      throw new Error('Invoice not found');
    }

    const { status, dueDate, notes, amountDue, client, eWayBillNumber } = req.body;

    if (status) invoice.status = status;
    if (dueDate) invoice.dueDate = new Date(dueDate);
    if (notes !== undefined) invoice.notes = notes;
    if (amountDue !== undefined) invoice.amountDue = Number(amountDue);
    if (client && mongoose.Types.ObjectId.isValid(client)) invoice.client = client;
    if (eWayBillNumber !== undefined) invoice.eWayBillNumber = eWayBillNumber;

    const updated = await invoice.save();
    const populated = await Invoice.findById(updated._id)
      .populate('client', 'companyName email phone address gstin')
      .populate('order', 'orderNumber totalAmount status');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private/Admin
const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      res.status(404);
      throw new Error('Invoice not found');
    }

    await invoice.deleteOne();
    res.json({ message: 'Invoice removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  recordPayment,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};

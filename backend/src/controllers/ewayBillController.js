const EWayBill = require('../models/EWayBill');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const mongoose = require('mongoose');

// @desc    Get e-Way bills (with optional pagination)
// @route   GET /api/eway-bills
// @access  Private/Accounts
const getEWayBills = async (req, res, next) => {
  try {
    let query = {};
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      const skip = (page - 1) * limit;
      const total = await EWayBill.countDocuments(query);
      const bills = await EWayBill.find(query)
        .populate('order', 'orderNumber totalAmount')
        .populate('invoice', 'invoiceNumber grandTotal status eWayBillNumber')
        .populate('dispatch', 'dispatchNumber status')
        .populate('generatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.json({
        ewayBills: bills,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      });
    }

    const bills = await EWayBill.find(query)
      .populate('order', 'orderNumber totalAmount')
      .populate('invoice', 'invoiceNumber grandTotal status eWayBillNumber')
      .populate('dispatch', 'dispatchNumber status')
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (error) {
    next(error);
  }
};

// @desc    Generate a new Indian GST e-Way bill
// @route   POST /api/eway-bills
// @access  Private/Accounts
const generateEWayBill = async (req, res, next) => {
  try {
    const {
      invoice: invoiceParam,
      invoiceId,
      orderId,
      dispatchId,
      transporter,
      transporterId,
      vehicleNumber,
      validDays,
      fromAddress,
      toAddress,
    } = req.body;

    const targetInvoiceId = invoiceParam || invoiceId;
    let targetInvoice = null;
    let order = null;

    if (targetInvoiceId && mongoose.Types.ObjectId.isValid(targetInvoiceId)) {
      targetInvoice = await Invoice.findById(targetInvoiceId).populate('client').populate('order');
      if (targetInvoice && targetInvoice.order) {
        order = targetInvoice.order;
      }
    }

    let targetOrderId = orderId || (targetInvoice ? targetInvoice.order?._id : null);

    if (!order && targetOrderId && mongoose.Types.ObjectId.isValid(targetOrderId)) {
      order = await Order.findById(targetOrderId).populate('client');
    }

    if (!targetInvoice && !order) {
      // Fallback to any order if none provided
      order = await Order.findOne({}).populate('client');
    }

    const billNumber = `EWB-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const validity = new Date();
    validity.setDate(validity.getDate() + (Number(validDays) || 3));

    const validDispatchId = dispatchId && mongoose.Types.ObjectId.isValid(dispatchId) ? dispatchId : null;
    const strDispatchNumber = (typeof dispatchId === 'string' && dispatchId.trim()) ? dispatchId.trim() : 'DSP-401';
    const validOrderId = order ? order._id : (mongoose.Types.ObjectId.isValid(targetOrderId) ? targetOrderId : null);

    // Derive values from invoice or order
    const totalValue = targetInvoice?.grandTotal || targetInvoice?.amountDue || order?.totalAmount || 245000;
    const clientData = targetInvoice?.client || order?.client;

    const computedFromAddress = fromAddress || {
      name: 'BoxStories Fulfillment Center',
      gstin: '27AADCB8901F1Z1',
      street: 'Warehouse G-12, Sector 8',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
    };

    const computedToAddress = toAddress || {
      name: clientData?.companyName || 'Corporate Client',
      gstin: clientData?.gstin || targetInvoice?.gstin || '',
      street: clientData?.address?.street || order?.shippingAddress?.street || 'Corporate Hub, Central Park',
      city: clientData?.address?.city || order?.shippingAddress?.city || 'Bangalore',
      state: clientData?.address?.state || order?.shippingAddress?.state || 'Karnataka',
      zipCode: clientData?.address?.zipCode || order?.shippingAddress?.zipCode || '560001',
    };

    const ewb = await EWayBill.create({
      billNumber,
      order: validOrderId,
      invoice: targetInvoice?._id || null,
      dispatch: validDispatchId,
      dispatchNumber: strDispatchNumber,
      documentType: targetInvoice ? 'Invoice' : 'Bill',
      documentNumber: targetInvoice?.invoiceNumber || (order?.orderNumber ? `INV-${order.orderNumber}` : ''),
      documentDate: targetInvoice?.issueDate || new Date(),
      transporter: transporter || 'Delhivery Express Logistics',
      transporterId: transporterId || 'TRANS-IN-9081',
      vehicleNumber: vehicleNumber || 'MH-04-AB-9821',
      totalValue,
      validFrom: new Date(),
      validUpto: validity,
      fromAddress: computedFromAddress,
      toAddress: computedToAddress,
      generatedBy: req.user._id,
      status: 'Generated',
    });

    // If generated for an invoice, update the invoice with eWayBillNumber
    if (targetInvoice) {
      targetInvoice.eWayBillNumber = billNumber;
      targetInvoice.eWayBillDate = new Date();
      await targetInvoice.save();
    }

    res.status(201).json({
      message: 'eWay Bill generated successfully',
      billNumber,
      ewayBill: ewb,
      invoice: targetInvoice,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEWayBills,
  generateEWayBill,
};

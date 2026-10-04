const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

// Helper to generate PO numbers
const generatePONumber = () => {
  return `PO-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;
};

// @desc    Get all purchase orders (with optional pagination & search)
// @route   GET /api/purchase-orders
// @access  Private
const getPurchaseOrders = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [
        { poNumber: searchRegex },
      ];
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      const skip = (page - 1) * limit;
      const total = await PurchaseOrder.countDocuments(query);
      const pos = await PurchaseOrder.find(query)
        .populate('vendor', 'name contactPerson email phone')
        .populate('createdBy', 'name email')
        .populate('approvedBy', 'name email')
        .populate('items.product', 'name sku basePrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.json({
        purchaseOrders: pos,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      });
    }

    const pos = await PurchaseOrder.find(query)
      .populate('vendor', 'name contactPerson email phone')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('items.product', 'name sku basePrice')
      .sort({ createdAt: -1 });
    res.json(pos);
  } catch (error) {
    next(error);
  }
};

// @desc    Get purchase order by ID
// @route   GET /api/purchase-orders/:id
// @access  Private
const getPurchaseOrderById = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate('vendor')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('items.product');

    if (!po) {
      res.status(404);
      throw new Error('Purchase Order not found');
    }
    res.json(po);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new purchase order
// @route   POST /api/purchase-orders
// @access  Private/Procurement
const createPurchaseOrder = async (req, res, next) => {
  try {
    const { vendor, items, expectedDeliveryDate, notes, terms } = req.body;

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No items provided for purchase order');
    }

    let totalAmount = 0;
    const finalItems = [];

    for (const item of items) {
      const productObj = await Product.findById(item.product);
      if (!productObj) {
        res.status(404);
        throw new Error(`Product ${item.product} not found`);
      }

      const totalItemCost = Number(item.unitPrice) * Number(item.quantity);
      totalAmount += totalItemCost;

      finalItems.push({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: totalItemCost,
      });
    }

    const po = await PurchaseOrder.create({
      poNumber: generatePONumber(),
      vendor,
      items: finalItems,
      totalAmount,
      expectedDeliveryDate,
      createdBy: req.user._id,
      notes: notes || '',
      terms: terms || '',
      status: 'Pending Approval',
    });

    res.status(201).json(po);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a purchase order
// @route   PUT /api/purchase-orders/:id/approve
// @access  Private/Admin
const approvePurchaseOrder = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) {
      res.status(404);
      throw new Error('Purchase Order not found');
    }

    if (!['SuperAdmin', 'Admin'].includes(req.user.role)) {
      res.status(403);
      throw new Error('Only admins can approve purchase orders');
    }

    po.status = 'Approved';
    po.approvedBy = req.user._id;
    po.approvedAt = new Date();

    const updatedPo = await po.save();
    res.json(updatedPo);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a purchase order status
// @route   PUT /api/purchase-orders/:id/status
// @access  Private
const updatePOStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) {
      res.status(404);
      throw new Error('Purchase Order not found');
    }

    po.status = status;
    const updatedPo = await po.save();
    res.json(updatedPo);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  approvePurchaseOrder,
  updatePOStatus,
};

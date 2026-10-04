const GoodsReceipt = require('../models/GoodsReceipt');
const PurchaseOrder = require('../models/PurchaseOrder');
const Inventory = require('../models/Inventory');

// Helper to generate GRN numbers
const generateGRNNumber = () => {
  return `GRN-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;
};

// @desc    Get all goods receipt records (with optional pagination)
// @route   GET /api/goods-receipts
// @access  Private
const getGoodsReceipts = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [{ grnNumber: searchRegex }];
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      const skip = (page - 1) * limit;
      const total = await GoodsReceipt.countDocuments(query);
      const grns = await GoodsReceipt.find(query)
        .populate('purchaseOrder', 'poNumber totalAmount status')
        .populate('vendor', 'name contactPerson email phone')
        .populate('receivedBy', 'name email')
        .populate('inspectedBy', 'name email')
        .populate('receivedItems.product', 'name sku basePrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.json({
        goodsReceipts: grns,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      });
    }

    const grns = await GoodsReceipt.find(query)
      .populate('purchaseOrder', 'poNumber totalAmount status')
      .populate('vendor', 'name contactPerson email phone')
      .populate('receivedBy', 'name email')
      .populate('inspectedBy', 'name email')
      .populate('receivedItems.product', 'name sku basePrice')
      .sort({ createdAt: -1 });
    res.json(grns);
  } catch (error) {
    next(error);
  }
};

// @desc    Get goods receipt record by ID
// @route   GET /api/goods-receipts/:id
// @access  Private
const getGoodsReceiptById = async (req, res, next) => {
  try {
    const grn = await GoodsReceipt.findById(req.params.id)
      .populate('purchaseOrder')
      .populate('vendor')
      .populate('receivedBy')
      .populate('inspectedBy')
      .populate('receivedItems.product');

    if (!grn) {
      res.status(404);
      throw new Error('Goods Receipt Record not found');
    }
    res.json(grn);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new goods receipt note (GRN) against a PO
// @route   POST /api/goods-receipts
// @access  Private/Warehouse
const createGoodsReceipt = async (req, res, next) => {
  try {
    const { purchaseOrderId, receivedItems, notes } = req.body;

    const po = await PurchaseOrder.findById(purchaseOrderId);
    if (!po) {
      res.status(404);
      throw new Error('Purchase Order not found');
    }

    const grnItems = receivedItems.map(item => {
      const poItem = po.items.find(pi => pi.product.toString() === item.product.toString());
      return {
        product: item.product,
        orderedQty: poItem ? poItem.quantity : 0,
        receivedQty: item.receivedQty,
        acceptedQty: item.acceptedQty || 0,
        rejectedQty: item.rejectedQty || 0,
        reason: item.reason || '',
      };
    });

    const grn = await GoodsReceipt.create({
      grnNumber: generateGRNNumber(),
      purchaseOrder: purchaseOrderId,
      vendor: po.vendor,
      receivedItems: grnItems,
      receivedBy: req.user._id,
      notes: notes || '',
      status: 'Pending Inspection',
    });

    // Update PO status to reflect receipt progress
    po.status = 'Partially Received';
    await po.save();

    res.status(201).json(grn);
  } catch (error) {
    next(error);
  }
};

// @desc    Record inspection result and update warehouse stock levels
// @route   PUT /api/goods-receipts/:id/inspect
// @access  Private/Procurement
const inspectGoodsReceipt = async (req, res, next) => {
  try {
    const { itemsInspection } = req.body; // array of { product, acceptedQty, rejectedQty, reason }
    const grn = await GoodsReceipt.findById(req.params.id);

    if (!grn) {
      res.status(404);
      throw new Error('Goods Receipt record not found');
    }

    let allAccepted = true;
    let totalAccepted = 0;

    for (const insp of itemsInspection) {
      const item = grn.receivedItems.find(ri => ri.product.toString() === insp.product.toString());
      if (item) {
        item.acceptedQty = insp.acceptedQty;
        item.rejectedQty = insp.rejectedQty;
        item.reason = insp.reason || '';

        totalAccepted += insp.acceptedQty;
        if (insp.rejectedQty > 0) {
          allAccepted = false;
        }

        // Add verified accepted quantity into inventory stock levels
        await Inventory.findOneAndUpdate(
          { product: item.product },
          {
            $inc: { availableQty: insp.acceptedQty },
            $push: {
              history: {
                type: 'Inbound',
                quantity: insp.acceptedQty,
                reference: `GRN Inbound Inspection: ${grn.grnNumber}`,
                performedBy: req.user._id,
              },
            },
          },
          { upsert: true }
        );
      }
    }

    grn.status = allAccepted ? 'Accepted' : 'Partially Accepted';
    grn.inspectedBy = req.user._id;
    const updatedGrn = await grn.save();

    // Check if the related PO is fully received
    const po = await PurchaseOrder.findById(grn.purchaseOrder);
    if (po) {
      // Simplistic check: if status is approved/received
      po.status = 'Received';
      await po.save();
    }

    res.json(updatedGrn);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoodsReceipts,
  getGoodsReceiptById,
  createGoodsReceipt,
  inspectGoodsReceipt,
};

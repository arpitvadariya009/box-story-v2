const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');
const PurchaseOrder = require('../models/PurchaseOrder');
const GoodsReceipt = require('../models/GoodsReceipt');
const Client = require('../models/Client');
const Vendor = require('../models/Vendor');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get Data Entry Operator dashboard metrics
// @route   GET /api/data-entry/dashboard
// @access  Private/DataEntry
// ─────────────────────────────────────────────────────────────────────────────
const getDataEntryDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // All audit logs for this user
    const allLogs = await AuditLog.find({ user: userId }).sort({ createdAt: -1 });

    // Today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const submittedToday = allLogs.filter(
      (l) => l.createdAt >= todayStart && l.createdAt <= todayEnd
    );

    const rejectedCount = allLogs.filter((l) => l.changes?.status === 'Rejected').length;

    // Pending: submitted but not yet approved/rejected — status 'Pending'
    const pendingLogs = allLogs.filter((l) => l.changes?.status === 'Pending');

    // Avg processing time (based on time from creation to status update)
    const processedLogs = allLogs.filter(
      (l) => l.changes?.status === 'Approved' || l.changes?.status === 'Rejected'
    );
    let avgHours = 0;
    if (processedLogs.length > 0) {
      const totalMs = processedLogs.reduce((acc, l) => {
        const diff = l.updatedAt - l.createdAt;
        return acc + (isNaN(diff) ? 0 : diff);
      }, 0);
      avgHours = Math.round((totalMs / processedLogs.length / 3600000) * 10) / 10 || 0;
    }

    // Pending tasks list (most recent 10 pending)
    const pendingTasks = pendingLogs.slice(0, 10).map((l) => ({
      _id: l._id,
      title: l.description || 'Untitled Task',
      type: l.model || 'Unknown',
      priority: l.changes?.priority || 'Medium',
      createdAt: l.createdAt,
    }));

    // Today's submissions with status
    const todaySubmissions = submittedToday.slice(0, 10).map((l) => ({
      _id: l._id,
      title: l.description || 'Untitled',
      type: l.model || 'Unknown',
      status: l.changes?.status || 'Pending',
      createdAt: l.createdAt,
    }));

    // Rejection alerts (rejected entries)
    const rejectionAlerts = allLogs
      .filter((l) => l.changes?.status === 'Rejected')
      .slice(0, 5)
      .map((l) => ({
        _id: l._id,
        title: l.description || 'Untitled',
        reason: l.changes?.rejectionNote || 'No reason provided',
        type: l.model || 'Unknown',
        documentId: l.documentId,
      }));

    res.json({
      metrics: {
        pendingTasks: pendingLogs.length,
        submittedToday: submittedToday.length,
        rejected: rejectedCount,
        avgProcessingHours: avgHours,
      },
      pendingTasks,
      todaySubmissions,
      rejectionAlerts,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all submissions for the Data Entry Operator
// @route   GET /api/data-entry/submissions
// @access  Private/DataEntry
// ─────────────────────────────────────────────────────────────────────────────
const getSubmissions = async (req, res, next) => {
  try {
    const { status, type, search } = req.query;

    const query = { user: req.user._id };
    if (status && status !== 'All') {
      query['changes.status'] = status;
    }
    if (type && type !== 'All') {
      query.model = type;
    }
    if (search && search.trim()) {
      query.description = new RegExp(search.trim(), 'i');
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      const skip = (page - 1) * limit;
      const total = await AuditLog.countDocuments(query);
      const logs = await AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

      const mapped = logs.map((l) => ({
        _id: l._id,
        title: l.description || 'Untitled',
        type: l.model || 'Unknown',
        status: l.changes?.status || 'Pending',
        priority: l.changes?.priority || 'Normal',
        rejectionNote: l.changes?.rejectionNote || '',
        documentId: l.documentId,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      }));

      return res.json({
        submissions: mapped,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      });
    }

    const logs = await AuditLog.find(query).sort({ createdAt: -1 });

    const mapped = logs.map((l) => ({
      _id: l._id,
      title: l.description || 'Untitled',
      type: l.model || 'Unknown',
      status: l.changes?.status || 'Pending',
      priority: l.changes?.priority || 'Normal',
      rejectionNote: l.changes?.rejectionNote || '',
      documentId: l.documentId,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
    }));

    res.json(mapped);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single submission by AuditLog ID
// @route   GET /api/data-entry/submissions/:id
// @access  Private/DataEntry
// ─────────────────────────────────────────────────────────────────────────────
const getSubmissionById = async (req, res, next) => {
  try {
    const log = await AuditLog.findOne({ _id: req.params.id, user: req.user._id });

    if (!log) {
      res.status(404);
      throw new Error('Submission not found');
    }

    let document = null;
    if (log.model === 'Product' && log.documentId) {
      document = await Product.findById(log.documentId).populate('vendor', 'name');
    } else if (log.model === 'Order' && log.documentId) {
      document = await Order.findById(log.documentId)
        .populate('client', 'companyName')
        .populate('items.product', 'name sku');
    } else if (log.model === 'GoodsReceipt' && log.documentId) {
      document = await GoodsReceipt.findById(log.documentId)
        .populate('purchaseOrder', 'poNumber')
        .populate('receivedItems.product', 'name sku');
    }

    res.json({
      _id: log._id,
      title: log.description,
      type: log.model,
      status: log.changes?.status || 'Pending',
      rejectionNote: log.changes?.rejectionNote || '',
      priority: log.changes?.priority || 'Normal',
      documentId: log.documentId,
      document,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Submit a new product entry (Draft state, pending review)
// @route   POST /api/data-entry/products
// @access  Private/DataEntry
// ─────────────────────────────────────────────────────────────────────────────
const submitProductEntry = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      description,
      specifications,
      category,
      vendor,
      basePrice,
      minOrderQty,
      images,
      priority,
    } = req.body;

    const productExists = await Product.findOne({ sku });
    if (productExists) {
      res.status(400);
      throw new Error(`Product SKU "${sku}" already exists`);
    }

    // Create product in Draft state for review
    const product = await Product.create({
      name,
      sku,
      description: description || '',
      category,
      basePrice: parseFloat(basePrice) || 0,
      minOrderQty: parseInt(minOrderQty) || 1,
      images: images || [],
      vendor: vendor || null,
      status: 'Draft',
    });

    // Auto-create empty inventory record
    await Inventory.create({
      product: product._id,
      availableQty: 0,
      history: [
        {
          type: 'Inbound',
          quantity: 0,
          reference: 'Data Entry - Pending Review',
          performedBy: req.user._id,
        },
      ],
    });

    // Log submission in AuditLog with status tracking
    const auditTitle = `Enter Product Data - ${sku}`;
    const audit = await AuditLog.create({
      user: req.user._id,
      action: 'Create',
      model: 'Product',
      documentId: product._id,
      description: auditTitle,
      changes: {
        status: 'Pending',
        priority: priority || 'Medium',
        submissionType: 'product',
      },
    });

    // Emit socket notification to admins
    try {
      const Notification = require('../models/Notification');
      const notification = await Notification.create({
        recipient: req.user._id,
        sender: req.user._id,
        title: 'Product Entry Submitted',
        message: `New product entry submitted for review: ${name} (${sku})`,
        type: 'General',
        priority: priority || 'Normal',
      });
      const io = req.app.get('io');
      if (io) {
        io.to('admin').to('superadmin').emit('new_notification', notification);
      }
    } catch (e) {
      console.error('Notification error:', e.message);
    }

    res.status(201).json({ product, auditId: audit._id });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Submit a new inventory / GRN entry
// @route   POST /api/data-entry/inventory
// @access  Private/DataEntry
// ─────────────────────────────────────────────────────────────────────────────
const submitInventoryEntry = async (req, res, next) => {
  try {
    const {
      grnNumber,
      purchaseOrderId,
      productSku,
      stockQty,
      batchNumber,
      serialNumber,
      binLocation,
      priority,
    } = req.body;

    // Validate required fields
    if (!grnNumber) {
      res.status(400);
      throw new Error('GRN Number is required');
    }
    if (!stockQty) {
      res.status(400);
      throw new Error('Stock Quantity is required');
    }

    // Find product by SKU if provided
    let productId = null;
    if (productSku) {
      const product = await Product.findOne({ sku: productSku });
      if (!product) {
        res.status(404);
        throw new Error(`Product SKU "${productSku}" not found`);
      }
      productId = product._id;
    }

    // Validate PO exists if provided
    let po = null;
    if (purchaseOrderId) {
      po = await PurchaseOrder.findById(purchaseOrderId);
      if (!po) {
        res.status(404);
        throw new Error('Purchase Order not found');
      }
    }

    // Check for existing GRN number
    const existingGrn = await GoodsReceipt.findOne({ grnNumber });
    if (existingGrn) {
      res.status(400);
      throw new Error(`GRN Number "${grnNumber}" already exists`);
    }

    // Build GRN record (requires purchaseOrder + vendor from PO)
    const qty = parseInt(stockQty) || 0;
    const grnData = {
      grnNumber,
      purchaseOrder: po ? po._id : undefined,
      vendor: po ? po.vendor : undefined,
      receivedBy: req.user._id,
      status: 'Pending Inspection',
      notes: `Batch: ${batchNumber || 'N/A'} | Serial: ${serialNumber || 'N/A'} | Bin: ${binLocation || 'N/A'}`,
    };

    if (productId) {
      grnData.receivedItems = [
        {
          product: productId,
          orderedQty: qty,
          receivedQty: qty,
          acceptedQty: 0,
        },
      ];
    }

    // Only create GRN if we have both purchaseOrder and vendor
    let grn = null;
    if (po && productId) {
      grn = await GoodsReceipt.create(grnData);

      // Update inventory bin location if specified
      if (binLocation && productId) {
        await Inventory.findOneAndUpdate(
          { product: productId },
          { binLocation },
          { upsert: false }
        );
      }
    }

    // Log submission in AuditLog
    const auditTitle = `GRN Entry - ${grnNumber}`;
    const audit = await AuditLog.create({
      user: req.user._id,
      action: 'Create',
      model: 'GoodsReceipt',
      documentId: grn ? grn._id : null,
      description: auditTitle,
      changes: {
        status: 'Pending',
        priority: priority || 'Medium',
        submissionType: 'inventory',
        rawData: {
          grnNumber,
          productSku,
          stockQty: qty,
          batchNumber,
          serialNumber,
          binLocation,
          purchaseOrderId,
        },
      },
    });

    res.status(201).json({
      grn: grn || null,
      auditId: audit._id,
      message: grn
        ? 'GRN record created and pending inspection'
        : 'Inventory entry logged and pending admin review',
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Submit a new manually-keyed order entry
// @route   POST /api/data-entry/orders
// @access  Private/DataEntry
// ─────────────────────────────────────────────────────────────────────────────
const submitOrderEntry = async (req, res, next) => {
  try {
    const { client, items, shippingAddress, notes, priority } = req.body;

    if (!client) {
      res.status(400);
      throw new Error('Client is required');
    }
    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No items provided');
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;

    let subtotal = 0;
    const finalItems = [];

    for (const item of items) {
      const productObj = await Product.findById(item.product);
      if (!productObj) {
        res.status(404);
        throw new Error(`Product not found: ${item.product}`);
      }
      const itemPrice = productObj.basePrice;
      subtotal += itemPrice * (parseInt(item.quantity) || 1);
      finalItems.push({
        product: item.product,
        quantity: parseInt(item.quantity) || 1,
        price: itemPrice,
      });
    }

    const tax = subtotal * 0.18;
    const shippingCost = subtotal > 1000 ? 0 : 50;
    const totalAmount = subtotal + tax + shippingCost;

    const order = await Order.create({
      orderNumber,
      client,
      orderedBy: req.user._id,
      items: finalItems,
      subtotal,
      tax,
      shippingCost,
      totalAmount,
      shippingAddress,
      priority: priority || 'Normal',
      status: 'Pending Approval',
      notes: notes
        ? [{ message: notes, addedBy: req.user._id, addedAt: new Date() }]
        : [],
    });

    // Log submission in AuditLog
    const auditTitle = `Manual Order - ${orderNumber}`;
    const audit = await AuditLog.create({
      user: req.user._id,
      action: 'Create',
      model: 'Order',
      documentId: order._id,
      description: auditTitle,
      changes: {
        status: 'Pending',
        priority: priority || 'Normal',
        submissionType: 'order',
      },
    });

    // Notify admins
    try {
      const Notification = require('../models/Notification');
      const notification = await Notification.create({
        recipient: req.user._id,
        sender: req.user._id,
        title: 'Manual Order Submitted',
        message: `Data entry operator submitted order ${orderNumber} for client approval.`,
        type: 'OrderUpdate',
        priority: priority || 'Normal',
      });
      const io = req.app.get('io');
      if (io) {
        io.to('admin').to('superadmin').emit('new_notification', notification);
      }
    } catch (e) {
      console.error('Notification error:', e.message);
    }

    res.status(201).json({ order, auditId: audit._id });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Re-edit and resubmit a rejected product entry
// @route   PUT /api/data-entry/submissions/:auditId/resubmit
// @access  Private/DataEntry
// ─────────────────────────────────────────────────────────────────────────────
const resubmitEntry = async (req, res, next) => {
  try {
    const audit = await AuditLog.findOne({ _id: req.params.auditId, user: req.user._id });
    if (!audit) {
      res.status(404);
      throw new Error('Submission not found');
    }

    if (audit.changes?.status !== 'Rejected') {
      res.status(400);
      throw new Error('Only rejected entries can be resubmitted');
    }

    // Update the linked document based on model type
    if (audit.model === 'Product' && audit.documentId) {
      const { name, sku, description, category, basePrice, minOrderQty, images, vendor } = req.body;
      await Product.findByIdAndUpdate(audit.documentId, {
        name: name || undefined,
        sku: sku || undefined,
        description: description || undefined,
        category: category || undefined,
        basePrice: basePrice ? parseFloat(basePrice) : undefined,
        minOrderQty: minOrderQty ? parseInt(minOrderQty) : undefined,
        images: images || undefined,
        vendor: vendor || undefined,
        status: 'Draft',
      });
    }

    // Reset the audit log status to Pending
    audit.changes = {
      ...audit.changes,
      status: 'Pending',
      rejectionNote: '',
      resubmittedAt: new Date(),
    };
    await audit.save();

    res.json({ message: 'Entry resubmitted for review', auditId: audit._id });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all Purchase Orders (for inventory entry dropdown)
// @route   GET /api/data-entry/purchase-orders
// @access  Private/DataEntry
// ─────────────────────────────────────────────────────────────────────────────
const getPurchaseOrdersList = async (req, res, next) => {
  try {
    const pos = await PurchaseOrder.find({ status: { $in: ['Approved', 'Sent to Vendor'] } })
      .select('poNumber vendor totalAmount status')
      .populate('vendor', 'name');
    res.json(pos);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get clients list (for order entry dropdown)
// @route   GET /api/data-entry/clients
// @access  Private/DataEntry
// ─────────────────────────────────────────────────────────────────────────────
const getClientsList = async (req, res, next) => {
  try {
    const clients = await Client.find({ status: 'Active' }).select('companyName contactPerson email');
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get vendors list (for product entry supplier dropdown)
// @route   GET /api/data-entry/vendors
// @access  Private/DataEntry
// ─────────────────────────────────────────────────────────────────────────────
const getVendorsList = async (req, res, next) => {
  try {
    const vendors = await Vendor.find({ status: 'Active' }).select('name contactPerson email');
    res.json(vendors);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get products list (for order entry product dropdown)
// @route   GET /api/data-entry/products-list
// @access  Private/DataEntry
// ─────────────────────────────────────────────────────────────────────────────
const getProductsList = async (req, res, next) => {
  try {
    const products = await Product.find({ status: { $in: ['Available', 'Draft'] } })
      .select('name sku basePrice category');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get inventory bin locations list (for inventory entry dropdown)
// @route   GET /api/data-entry/bin-locations
// @access  Private/DataEntry
// ─────────────────────────────────────────────────────────────────────────────
const getBinLocations = async (req, res, next) => {
  try {
    const inventoryDocs = await Inventory.find({}).select('binLocation zone rack shelf warehouseLocation');
    const locations = inventoryDocs
      .filter((inv) => inv.binLocation)
      .map((inv) => ({
        label: inv.binLocation,
        value: inv.binLocation,
        warehouse: inv.warehouseLocation,
      }));
    // Deduplicate
    const unique = [...new Map(locations.map((l) => [l.value, l])).values()];
    res.json(unique);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDataEntryDashboard,
  getSubmissions,
  getSubmissionById,
  submitProductEntry,
  submitInventoryEntry,
  submitOrderEntry,
  resubmitEntry,
  getPurchaseOrdersList,
  getClientsList,
  getVendorsList,
  getProductsList,
  getBinLocations,
};

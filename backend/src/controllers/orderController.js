const Order = require('../models/Order');
const Product = require('../models/Product');
const Catalogue = require('../models/Catalogue');
const Inventory = require('../models/Inventory');
const DesignJob = require('../models/DesignJob');
const PickList = require('../models/PickList');
const Client = require('../models/Client');
const User = require('../models/User');

// Helper to generate unique order number
const generateOrderNumber = () => {
  return `ORD-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;
};

// @desc    Get all orders (High-Performance MongoDB Aggregation Pipeline with Facet)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res, next) => {
  try {
    const match = {};

    // Role-based filtering
    if (req.user.role === 'CorporateHRManager' || req.user.role === 'Employee') {
      match.client = req.user.client;
    }

    if (req.user.role === 'DesignCustomisation') {
      match.assignedDesigner = req.user._id;
    }

    if (req.user.role === 'WarehouseLogistics') {
      match.status = { $in: ['Approved', 'Design Approved', 'In Production', 'Quality Check', 'Ready to Pack', 'Packed', 'Ready to Ship', 'Dispatched'] };
    }

    if (req.user.role === 'BDM') {
      const clientIds = await Client.find({ assignedBDM: req.user._id }).distinct('_id');
      match.client = { $in: clientIds };
    }

    // Status filter
    if (req.query.status && req.query.status !== 'All') {
      match.status = req.query.status;
    }

    // Date range filter
    if (req.query.from || req.query.to) {
      match.createdAt = {};
      if (req.query.from) {
        match.createdAt.$gte = new Date(req.query.from);
      }
      if (req.query.to) {
        const toDate = new Date(req.query.to);
        toDate.setHours(23, 59, 59, 999);
        match.createdAt.$lte = toDate;
      }
    }

    // Search filter across orderNumber, client company, and product name
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      const [matchedClients, matchedProducts] = await Promise.all([
        Client.find({ companyName: searchRegex }).distinct('_id'),
        Product.find({ name: searchRegex }).distinct('_id'),
      ]);

      match.$or = [
        { orderNumber: searchRegex },
        { client: { $in: matchedClients } },
        { 'items.product': { $in: matchedProducts } },
      ];
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Single-pass MongoDB Aggregation Pipeline with $facet
    const pipeline = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          orders: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'clients',
                localField: 'client',
                foreignField: '_id',
                as: 'client',
                pipeline: [{ $project: { companyName: 1 } }],
              },
            },
            { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'productDocs',
                pipeline: [{ $project: { name: 1, sku: 1, basePrice: 1 } }],
              },
            },
            {
              $project: {
                _id: 1,
                orderNumber: 1,
                status: 1,
                priority: 1,
                totalAmount: 1,
                createdAt: 1,
                client: 1,
                items: {
                  $map: {
                    input: '$items',
                    as: 'item',
                    in: {
                      quantity: '$$item.quantity',
                      price: '$$item.price',
                      product: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$productDocs',
                              as: 'p',
                              cond: { $eq: ['$$p._id', '$$item.product'] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      },
    ];

    const [result] = await Order.aggregate(pipeline);
    const total = result?.metadata?.[0]?.total || 0;
    const orders = result?.orders || [];

    // If page/limit not passed, backward compatibility
    if (!req.query.page && !req.query.limit) {
      return res.json(orders);
    }

    return res.json({
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('client')
      .populate('orderedBy', 'name email')
      .populate('items.product')
      .populate('assignedDesigner', 'name email')
      .populate('assignedWarehouse', 'name email')
      .populate('notes.addedBy', 'name role');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Role check: CorporateHRManager and Employee can only view their own client's orders
    if (
      ['CorporateHRManager', 'Employee'].includes(req.user.role) &&
      req.user.client.toString() !== order.client._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { client, items, shippingAddress, priority, giftMessage, giftPersonalization, giftSelection } = req.body;

    const orderClientId = ['CorporateHRManager', 'Employee'].includes(req.user.role) ? req.user.client : client;

    if (!orderClientId) {
      res.status(400);
      throw new Error('Client selection is required');
    }

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No order items provided');
    }

    // Retrieve the client's catalogue or base products to get prices
    const catalogue = await Catalogue.findOne({ client: orderClientId, status: 'Active' });

    let subtotal = 0;
    const finalItems = [];

    for (const item of items) {
      const productObj = await Product.findById(item.product);
      if (!productObj) {
        res.status(404);
        throw new Error(`Product ${item.product} not found`);
      }

      // Check client-specific pricing in catalogue, fallback to basePrice
      let matchedPrice = productObj.basePrice;
      if (catalogue) {
        const catProd = catalogue.products.find(p => p.product.toString() === item.product.toString());
        if (catProd) {
          matchedPrice = catProd.clientPrice;
        }
      }

      subtotal += matchedPrice * item.quantity;
      finalItems.push({
        product: item.product,
        quantity: item.quantity,
        price: matchedPrice,
        customizationDetails: item.customizationDetails || null,
      });

      // Verify inventory availability
      const inventory = await Inventory.findOne({ product: item.product });
      if (inventory && inventory.availableQty < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for product ${productObj.name}. Available: ${inventory.availableQty}`);
      }
    }

    const tax = subtotal * 0.18; // 18% standard GST
    const shippingCost = subtotal > 1000 ? 0 : 50.0; // Free shipping over $1000
    const totalAmount = subtotal + tax + shippingCost;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      client: orderClientId,
      orderedBy: req.user._id,
      items: finalItems,
      subtotal,
      tax,
      shippingCost,
      totalAmount,
      shippingAddress,
      priority: priority || 'Normal',
      giftMessage: giftMessage || '',
      giftPersonalization: giftPersonalization || '',
      giftSelection: giftSelection || null,
      status: 'Pending Approval',
    });

    // Allocate inventory (reservedQty)
    for (const item of finalItems) {
      await Inventory.findOneAndUpdate(
        { product: item.product },
        { $inc: { reservedQty: item.quantity, availableQty: -item.quantity } }
      );
    }

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status in lifecycle
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingDetails, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const userRole = req.user.role;
    const oldStatus = order.status;

    // Client/HR can only cancel before approval
    if (['CorporateHRManager', 'Employee'].includes(userRole) && status !== 'Cancelled') {
      res.status(403);
      throw new Error('Clients can only request cancellation, not modify order stages');
    }

    // Role-based status transition validation
    if (userRole === 'DesignCustomisation' && !['In Design', 'Design Approved', 'Revision Requested'].includes(status)) {
      res.status(403);
      throw new Error('Design role can only manage design phases');
    }

    if (userRole === 'WarehouseLogistics' && !['Quality Check', 'Ready to Pack', 'Packed', 'Ready to Ship', 'Dispatched', 'In Transit', 'Delivered'].includes(status)) {
      res.status(403);
      throw new Error('Warehouse/Logistics role can only manage packing and dispatch phases');
    }

    order.status = status;

    if (notes) {
      order.notes.push({
        message: notes,
        addedBy: req.user._id,
      });
    }

    if (trackingDetails) {
      order.trackingDetails = {
        ...order.trackingDetails,
        ...trackingDetails,
      };
    }

    // Capture delivery dates
    if (status === 'Dispatched') {
      order.trackingDetails.dispatchedAt = new Date();
    }
    if (status === 'Delivered') {
      order.trackingDetails.deliveredAt = new Date();
      order.actualDeliveryDate = new Date();
    }

    // Handle approval tracking
    if (status === 'Approved' && oldStatus === 'Pending Approval') {
      order.approvedBy = req.user._id;
      order.approvedAt = new Date();

      // Trigger automatic designer assignment if customization needed
      const hasCustomization = order.items.some(item => item.customizationDetails && item.customizationDetails.brandingType);
      if (hasCustomization) {
        order.status = 'In Design';
        
        // Auto create Design Job
        await DesignJob.create({
          jobNumber: `DSN-${Date.now().toString().slice(-8)}`,
          order: order._id,
          client: order.client,
          type: 'Logo Printing',
          status: 'Pending',
          priority: order.priority === 'Critical' ? 'Urgent' : (order.priority === 'Urgent' ? 'High' : 'Normal'),
        });
      } else {
        // Auto create Picking List
        await PickList.create({
          pickListNumber: `PCK-${Date.now().toString().slice(-8)}`,
          order: order._id,
          items: order.items.map(i => ({
            product: i.product,
            quantity: i.quantity,
          })),
        });
      }
    }

    // If design approved, transition to production/warehouse picking
    if (status === 'Design Approved' && oldStatus === 'In Design') {
      await PickList.create({
        pickListNumber: `PCK-${Date.now().toString().slice(-8)}`,
        order: order._id,
        items: order.items.map(i => ({
          product: i.product,
          quantity: i.quantity,
        })),
      });
    }

    // If order is cancelled, return reserved inventory back to available quantity
    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      for (const item of order.items) {
        await Inventory.findOneAndUpdate(
          { product: item.product },
          { $inc: { reservedQty: -item.quantity, availableQty: item.quantity } }
        );
      }
    }

    // If order is delivered, remove from reserved quantity and log permanent outbound transaction
    if (status === 'Delivered' && oldStatus !== 'Delivered') {
      for (const item of order.items) {
        await Inventory.findOneAndUpdate(
          { product: item.product },
          {
            $inc: { reservedQty: -item.quantity },
            $push: {
              history: {
                type: 'Outbound',
                quantity: item.quantity,
                reference: `Order Delivery: ${order.orderNumber}`,
                performedBy: req.user._id,
              },
            },
          }
        );
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics / analytics
// @route   GET /api/orders/stats/summary
// @access  Private
const getOrderStats = async (req, res, next) => {
  try {
    // Only Admin, Procurement or Finance/Accounts can view general stats
    if (!['SuperAdmin', 'Admin', 'Procurement', 'AccountsTeam'].includes(req.user.role)) {
      res.status(403);
      throw new Error('Not authorized to access summary statistics');
    }

    const totalOrdersCount = await Order.countDocuments({});
    const pendingOrdersCount = await Order.countDocuments({ status: 'Pending Approval' });
    const activeOrdersCount = await Order.countDocuments({
      status: { $in: ['Approved', 'In Design', 'Design Approved', 'In Production', 'Quality Check', 'Ready to Pack', 'Packed', 'Ready to Ship', 'Dispatched', 'In Transit'] },
    });
    const completedOrdersCount = await Order.countDocuments({ status: 'Delivered' });

    // Calculate total revenue
    const revenueAgg = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
    ]);
    const totalSales = revenueAgg.length > 0 ? revenueAgg[0].totalSales : 0;

    res.json({
      totalOrders: totalOrdersCount,
      pendingApproval: pendingOrdersCount,
      activeProcessing: activeOrdersCount,
      delivered: completedOrdersCount,
      totalSalesRevenue: totalSales,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign order design customisation to designer
// @route   PUT /api/orders/:id/assign-design
// @access  Private/Admin
const assignDesign = async (req, res, next) => {
  try {
    const { designerId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.assignedDesigner = designerId;
    
    // Check if DesignJob exists, assign there too
    await DesignJob.findOneAndUpdate(
      { order: order._id },
      { assignedTo: designerId }
    );

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order details
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (req.body.status) order.status = req.body.status;
    if (req.body.totalAmount !== undefined) order.totalAmount = Number(req.body.totalAmount);
    if (req.body.notes !== undefined) order.notes = req.body.notes;
    if (req.body.expectedDeliveryDate) order.expectedDeliveryDate = req.body.expectedDeliveryDate;
    if (req.body.shippingAddress) {
      order.shippingAddress = {
        ...order.shippingAddress,
        ...req.body.shippingAddress,
      };
    }
    if (req.body.quantity && order.items?.length > 0) {
      order.items[0].quantity = Number(req.body.quantity);
    }

    const updatedOrder = await order.save();
    const populated = await Order.findById(updatedOrder._id)
      .populate('client', 'companyName contactPerson email phone')
      .populate('items.product', 'name sku basePrice images category');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    await Order.deleteOne({ _id: req.params.id });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getOrderStats,
  assignDesign,
};

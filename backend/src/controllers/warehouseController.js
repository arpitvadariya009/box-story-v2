const mongoose = require('mongoose');
const PickList = require('../models/PickList');
const PackingSlip = require('../models/PackingSlip');
const Dispatch = require('../models/Dispatch');
const WarehouseException = require('../models/WarehouseException');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');

// @desc    Get pick lists (with optional pagination)
// @route   GET /api/warehouse/pick-lists
// @access  Private/Warehouse
const getPickLists = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      const skip = (page - 1) * limit;
      const total = await PickList.countDocuments(query);
      const picks = await PickList.find(query)
        .populate('order', 'orderNumber status priority')
        .populate('items.product', 'name sku binLocation')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.json({
        pickLists: picks,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      });
    }

    const picks = await PickList.find(query)
      .populate('order', 'orderNumber status priority')
      .populate('items.product', 'name sku binLocation')
      .sort({ createdAt: -1 });

    res.json(picks);
  } catch (error) {
    next(error);
  }
};

// @desc    Start/assign picking list
// @route   PUT /api/warehouse/pick-lists/:id/start
// @access  Private/Warehouse
const startPickList = async (req, res, next) => {
  try {
    const pick = await PickList.findById(req.params.id);

    if (!pick) {
      res.status(404);
      throw new Error('Pick List not found');
    }

    pick.status = 'In Progress';
    pick.assignedTo = req.user._id;
    pick.startedAt = new Date();
    const updatedPick = await pick.save();

    res.json(updatedPick);
  } catch (error) {
    next(error);
  }
};

// @desc    Complete picking list
// @route   PUT /api/warehouse/pick-lists/:id/complete
// @access  Private/Warehouse
const completePickList = async (req, res, next) => {
  try {
    const { itemsPicked } = req.body; // array of { product, pickedQty }
    const pick = await PickList.findById(req.params.id);

    if (!pick) {
      res.status(404);
      throw new Error('Pick List not found');
    }

    let hasException = false;

    for (const pItem of itemsPicked) {
      const item = pick.items.find(i => i.product.toString() === pItem.product.toString());
      if (item) {
        item.pickedQty = pItem.pickedQty;
        if (pItem.pickedQty < item.quantity) {
          item.status = 'Short';
          hasException = true;
          
          // Auto log warehouse exception for inventory tracking
          await WarehouseException.create({
            exceptionNumber: `EXC-${Date.now().toString().slice(-8)}`,
            type: 'Shortage',
            relatedModel: 'PickList',
            relatedId: pick._id,
            product: item.product,
            quantity: item.quantity - pItem.pickedQty,
            description: `Inventory shortage during picking list verification. Ordered: ${item.quantity}, Picked: ${pItem.pickedQty}`,
            reportedBy: req.user._id,
          });
        } else {
          item.status = 'Picked';
        }
      }
    }

    pick.status = hasException ? 'Exception' : 'Completed';
    pick.completedAt = new Date();
    const updatedPick = await pick.save();

    // Trigger Packing slip preparation
    if (pick.status === 'Completed') {
      await PackingSlip.create({
        packingNumber: `PKG-${Date.now().toString().slice(-8)}`,
        order: pick.order,
        pickList: pick._id,
        items: pick.items.map(i => ({
          product: i.product,
          quantity: i.pickedQty,
        })),
        packedBy: req.user._id,
        status: 'Packing',
      });

      // Update Order Status
      await Order.findByIdAndUpdate(pick.order, { status: 'Ready to Pack' });
    }

    res.json(updatedPick);
  } catch (error) {
    next(error);
  }
};

// @desc    Get packing slips
// @route   GET /api/warehouse/packing
// @access  Private/Warehouse
const getPackingSlips = async (req, res, next) => {
  try {
    const packs = await PackingSlip.find({})
      .populate('order', 'orderNumber status priority shippingAddress')
      .populate('items.product', 'name sku');
    res.json(packs);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify and finalize package packing details
// @route   PUT /api/warehouse/packing/:id/verify
// @access  Private/Warehouse
const verifyPackingSlip = async (req, res, next) => {
  try {
    const { totalBoxes, totalWeight } = req.body;
    const pack = await PackingSlip.findById(req.params.id);

    if (!pack) {
      res.status(404);
      throw new Error('Packing slip record not found');
    }

    pack.status = 'Verified';
    pack.totalBoxes = totalBoxes || 1;
    pack.totalWeight = totalWeight || 0;
    pack.verifiedBy = req.user._id;
    const updatedPack = await pack.save();

    // Generate Dispatch record
    await Dispatch.create({
      dispatchNumber: `DSP-${Date.now().toString().slice(-8)}`,
      order: pack.order,
      packingSlip: pack._id,
      dispatchedBy: req.user._id,
      status: 'Pending',
    });

    // Update Order Status
    await Order.findByIdAndUpdate(pack.order, { status: 'Packed' });

    res.json(updatedPack);
  } catch (error) {
    next(error);
  }
};

// @desc    Get dispatches (with single-pass MongoDB aggregation pipeline & server-side pagination)
// @route   GET /api/warehouse/dispatches
// @access  Private/Warehouse
const getDispatches = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const isPaginated = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;

    const { search, status, dateFrom, dateTo, from, to } = req.query;

    const baseMatch = {};
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
      {
        $lookup: {
          from: 'clients',
          localField: 'order.client',
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
          from: 'packingslips',
          localField: 'packingSlip',
          foreignField: '_id',
          as: 'packingSlip',
        },
      },
      {
        $unwind: {
          path: '$packingSlip',
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
            { dispatchNumber: sRegex },
            { carrier: sRegex },
            { trackingNumber: sRegex },
            { awbNumber: sRegex },
            { 'order.orderNumber': sRegex },
            { 'client.companyName': sRegex },
            { 'packingSlip.packingNumber': sRegex },
          ],
        },
      });
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        dispatches: [
          { $sort: { createdAt: -1, _id: -1 } },
          { $skip: skip },
          { $limit: currentLimit },
        ],
        kpis: [
          {
            $group: {
              _id: null,
              totalDispatched: { $sum: 1 },
              inTransit: {
                $sum: {
                  $cond: [{ $in: ['$status', ['Dispatched', 'In Transit']] }, 1, 0],
                },
              },
              delivered: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0],
                },
              },
              exceptions: {
                $sum: {
                  $cond: [{ $in: ['$status', ['Cancelled', 'Exception']] }, 1, 0],
                },
              },
            },
          },
        ],
      },
    });

    const [result] = await Dispatch.aggregate(pipeline);

    const total = result?.metadata?.[0]?.total || 0;
    const dispatches = result?.dispatches || [];
    const kpis = result?.kpis?.[0] || {
      totalDispatched: total,
      inTransit: 0,
      delivered: 0,
      exceptions: 0,
    };

    if (!isPaginated) {
      return res.json(dispatches);
    }

    return res.json({
      dispatches,
      data: dispatches,
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

// @desc    Ship package and trigger transit tracking
// @route   PUT /api/warehouse/dispatches/:id/ship
// @access  Private/Warehouse
const shipDispatch = async (req, res, next) => {
  try {
    const { carrier, trackingNumber, awbNumber, vehicleNumber, driverName, driverPhone, eWayBillNumber, gatePassNumber } = req.body;
    const dispatch = await Dispatch.findById(req.params.id);

    if (!dispatch) {
      res.status(404);
      throw new Error('Dispatch record not found');
    }

    dispatch.carrier = carrier || '';
    dispatch.trackingNumber = trackingNumber || '';
    dispatch.awbNumber = awbNumber || '';
    dispatch.vehicleNumber = vehicleNumber || '';
    dispatch.driverName = driverName || '';
    dispatch.driverPhone = driverPhone || '';
    dispatch.eWayBillNumber = eWayBillNumber || '';
    dispatch.gatePassNumber = gatePassNumber || '';
    dispatch.status = 'Dispatched';
    
    const updatedDispatch = await dispatch.save();

    // Update order status and attach tracking logs
    await Order.findByIdAndUpdate(dispatch.order, {
      status: 'Dispatched',
      trackingDetails: {
        carrier,
        trackingNumber,
        awbNumber,
        dispatchedAt: new Date(),
      },
    });

    res.json(updatedDispatch);
  } catch (error) {
    next(error);
  }
};

// @desc    Get warehouse exceptions list (with optional pagination)
// @route   GET /api/warehouse/exceptions
// @access  Private/Warehouse
const getExceptions = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      const skip = (page - 1) * limit;
      const total = await WarehouseException.countDocuments(query);
      const exceptions = await WarehouseException.find(query)
        .populate('product', 'name sku category')
        .populate('reportedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.json({
        exceptions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      });
    }

    const exceptions = await WarehouseException.find(query)
      .populate('product', 'name sku category')
      .populate('reportedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(exceptions);
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve a warehouse exception
// @route   PUT /api/warehouse/exceptions/:id/resolve
// @access  Private/Warehouse
const resolveException = async (req, res, next) => {
  try {
    const { resolution } = req.body;
    const exception = await WarehouseException.findById(req.params.id);

    if (!exception) {
      res.status(404);
      throw new Error('Exception log not found');
    }

    exception.status = 'Resolved';
    exception.resolution = resolution;
    exception.resolvedBy = req.user._id;
    exception.resolvedAt = new Date();

    const updatedException = await exception.save();
    res.json(updatedException);
  } catch (error) {
    next(error);
  }
};

// @desc    Create dispatch directly
// @route   POST /api/warehouse/dispatches
// @access  Private/Warehouse
const createDispatch = async (req, res, next) => {
  try {
    const { orderNumber, carrier, trackingNumber, estimatedDelivery } = req.body;

    // Find order
    let order = await Order.findOne({
      orderNumber: { $regex: new RegExp(`^${orderNumber}$`, 'i') },
    });

    if (!order) {
      // If we don't find it, check if we can query by ID
      if (mongoose.Types.ObjectId.isValid(orderNumber)) {
        order = await Order.findById(orderNumber);
      }
    }

    if (!order) {
      res.status(404);
      throw new Error(`Order ${orderNumber} not found`);
    }

    // Create direct dispatch
    const dispatch = await Dispatch.create({
      dispatchNumber: `DSP-${Date.now().toString().slice(-8)}`,
      order: order._id,
      carrier: carrier || '',
      trackingNumber: trackingNumber || '',
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
      dispatchedBy: req.user._id,
      status: 'In Transit',
    });

    // Update order status
    order.status = 'Dispatched';
    order.trackingDetails = {
      carrier: carrier || '',
      trackingNumber: trackingNumber || '',
      dispatchedAt: new Date(),
    };
    await order.save();

    // Populate order info to return to client
    const populatedDispatch = await Dispatch.findById(dispatch._id)
      .populate('order', 'orderNumber totalAmount shippingAddress status')
      .populate('packingSlip', 'packingNumber totalBoxes totalWeight');

    res.status(201).json(populatedDispatch);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPickLists,
  startPickList,
  completePickList,
  getPackingSlips,
  verifyPackingSlip,
  getDispatches,
  shipDispatch,
  getExceptions,
  resolveException,
  createDispatch,
};


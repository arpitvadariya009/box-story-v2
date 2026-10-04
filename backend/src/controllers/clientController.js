const Client = require('../models/Client');
const Order = require('../models/Order');
const Catalogue = require('../models/Catalogue');
const User = require('../models/User');

// @desc    Get all corporate clients (High-Performance MongoDB Aggregation Pipeline with Facet)
// @route   GET /api/clients
// @access  Private/Admin/BDM
const getClients = async (req, res, next) => {
  try {
    const match = {};

    // BDM role can only see their assigned clients
    if (req.user.role === 'BDM') {
      match.assignedBDM = req.user._id;
    }

    if (req.query.status && req.query.status !== 'All' && req.query.status !== 'All statuses') {
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

    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      match.$or = [
        { companyName: searchRegex },
        { contactPerson: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { industry: searchRegex },
        { gstin: searchRegex },
      ];
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          clients: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'users',
                localField: 'assignedBDM',
                foreignField: '_id',
                as: 'assignedBDM',
                pipeline: [{ $project: { name: 1, email: 1 } }],
              },
            },
            { $unwind: { path: '$assignedBDM', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'client',
                as: 'clientOrders',
                pipeline: [{ $project: { totalAmount: 1 } }],
              },
            },
            {
              $lookup: {
                from: 'catalogues',
                localField: '_id',
                foreignField: 'client',
                as: 'clientCatalogues',
                pipeline: [{ $project: { _id: 1 } }],
              },
            },
            {
              $addFields: {
                ordersCount: { $size: '$clientOrders' },
                campaignsCount: { $size: '$clientCatalogues' },
                totalSpend: { $sum: '$clientOrders.totalAmount' },
              },
            },
            {
              $project: {
                clientOrders: 0,
                clientCatalogues: 0,
              },
            },
          ],
        },
      },
    ];

    const [result] = await Client.aggregate(pipeline);
    const total = result?.metadata?.[0]?.total || 0;
    const clients = result?.clients || [];

    if (!req.query.page && !req.query.limit) {
      return res.json(clients);
    }

    return res.json({
      clients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single corporate client by ID
// @route   GET /api/clients/:id
// @access  Private
const getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id).populate('assignedBDM', 'name email');

    if (!client) {
      res.status(404);
      throw new Error('Client not found');
    }

    // Authorization check: Admin, BDM assigned to this client, or User belongs to this client
    if (
      !['SuperAdmin', 'Admin'].includes(req.user.role) &&
      req.user.role === 'BDM' && client.assignedBDM?.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to access this client information');
    }

    if (
      !['SuperAdmin', 'Admin', 'BDM'].includes(req.user.role) &&
      req.user.client?.toString() !== client._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to access this client information');
    }

    res.json(client);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new corporate client
// @route   POST /api/clients
// @access  Private/Admin/BDM
const createClient = async (req, res, next) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      address,
      billingAddress,
      logo,
      gstin,
      pan,
      industry,
      contractStartDate,
      contractEndDate,
      creditLimit,
      paymentTerms,
      assignedBDM,
      notes,
    } = req.body;

    const clientExists = await Client.findOne({ companyName });

    if (clientExists) {
      res.status(400);
      throw new Error('Client with this company name already exists');
    }

    // If BDM is creating, assign themselves by default
    const bdmId = req.user.role === 'BDM' ? req.user._id : (assignedBDM || null);

    const client = await Client.create({
      companyName,
      contactPerson,
      email,
      phone,
      address,
      billingAddress: billingAddress || address,
      logo: logo || '',
      gstin: gstin || '',
      pan: pan || '',
      industry: industry || '',
      contractStartDate: contractStartDate || null,
      contractEndDate: contractEndDate || null,
      creditLimit: creditLimit || 0,
      paymentTerms: paymentTerms || 'Net 30',
      assignedBDM: bdmId,
      notes: notes || '',
    });

    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a corporate client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      res.status(404);
      throw new Error('Client not found');
    }

    // Authorization check: Admin, or assigned BDM, or User belongs to this client
    if (
      !['SuperAdmin', 'Admin'].includes(req.user.role) &&
      req.user.role === 'BDM' && client.assignedBDM?.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to update this client');
    }

    if (
      !['SuperAdmin', 'Admin', 'BDM'].includes(req.user.role) &&
      req.user.client?.toString() !== client._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to update this client');
    }

    client.companyName = req.body.companyName || client.companyName;
    client.contactPerson = req.body.contactPerson || client.contactPerson;
    client.email = req.body.email || client.email;
    client.phone = req.body.phone || client.phone;
    client.address = req.body.address || client.address;
    client.billingAddress = req.body.billingAddress || client.billingAddress;
    client.logo = req.body.logo || client.logo;
    client.gstin = req.body.gstin !== undefined ? req.body.gstin : client.gstin;
    client.pan = req.body.pan !== undefined ? req.body.pan : client.pan;
    client.industry = req.body.industry || client.industry;
    client.contractStartDate = req.body.contractStartDate !== undefined ? req.body.contractStartDate : client.contractStartDate;
    client.contractEndDate = req.body.contractEndDate !== undefined ? req.body.contractEndDate : client.contractEndDate;
    client.creditLimit = req.body.creditLimit !== undefined ? req.body.creditLimit : client.creditLimit;
    client.paymentTerms = req.body.paymentTerms || client.paymentTerms;
    client.assignedBDM = req.body.assignedBDM !== undefined ? req.body.assignedBDM : client.assignedBDM;
    client.notes = req.body.notes !== undefined ? req.body.notes : client.notes;
    client.status = req.body.status || client.status;

    const updatedClient = await client.save();
    res.json(updatedClient);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a corporate client
// @route   DELETE /api/clients/:id
// @access  Private/Admin
const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      res.status(404);
      throw new Error('Client not found');
    }

    await Client.deleteOne({ _id: req.params.id });
    res.json({ message: 'Client removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};

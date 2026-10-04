const mongoose = require('mongoose');
const Product = require('../models/Product');
const Catalogue = require('../models/Catalogue');
const Inventory = require('../models/Inventory');
const Vendor = require('../models/Vendor');

// @desc    Get all products (Base Catalogue) with High-Performance MongoDB Aggregation Pipeline
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
  try {
    const match = {};

    if (req.query.category && req.query.category !== 'All') {
      match.category = req.query.category;
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
        { name: searchRegex },
        { sku: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
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
          products: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'inventories',
                localField: '_id',
                foreignField: 'product',
                as: 'inventoryDoc',
                pipeline: [{ $project: { availableQty: 1, currentStock: 1, reservedQty: 1 } }],
              },
            },
            {
              $addFields: {
                inventory: { $arrayElemAt: ['$inventoryDoc', 0] },
                availableQty: {
                  $ifNull: [{ $arrayElemAt: ['$inventoryDoc.availableQty', 0] }, 0],
                },
              },
            },
            {
              $project: {
                inventoryDoc: 0,
              },
            },
          ],
        },
      },
    ];

    const [result] = await Product.aggregate(pipeline);
    const total = result?.metadata?.[0]?.total || 0;
    const products = result?.products || [];

    if (!req.query.page && !req.query.limit) {
      // Non-paginated query (for dropdowns / pickers)
      const allProds = await Product.find(match).sort({ createdAt: -1 });
      return res.json(allProds);
    }

    return res.json({
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product and auto-initialize inventory
// @route   POST /api/products
// @access  Private/Admin/DataEntry
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      description,
      category,
      basePrice,
      images,
      dimensions,
      brand,
      material,
      color,
      minOrderQty,
      maxOrderQty,
      leadTimeDays,
      isCustomizable,
      customizationOptions,
      tags,
      vendor,
      hsnCode,
      gstRate,
      initialQty,
      binLocation,
      status,
    } = req.body;

    const productExists = await Product.findOne({ sku });

    if (productExists) {
      res.status(400);
      throw new Error('Product SKU already exists');
    }

    const product = await Product.create({
      name,
      sku,
      description,
      category,
      basePrice,
      images: images || [],
      dimensions,
      brand: brand || '',
      material: material || '',
      color: color || '',
      minOrderQty: minOrderQty || 1,
      maxOrderQty: maxOrderQty || 10000,
      leadTimeDays: leadTimeDays || 7,
      isCustomizable: isCustomizable || false,
      customizationOptions: customizationOptions || [],
      tags: tags || [],
      vendor: vendor || null,
      hsnCode: hsnCode || '',
      gstRate: gstRate || 18,
      status: status || 'Available',
    });

    // Auto-create corresponding Inventory entry
    await Inventory.create({
      product: product._id,
      availableQty: initialQty || 0,
      binLocation: binLocation || '',
      history: [
        {
          type: 'Inbound',
          quantity: initialQty || 0,
          reference: 'Initial Stock Input',
          performedBy: req.user._id,
        },
      ],
    });

    // Auto-create Notification & Emit Socket Event
    try {
      const Notification = require('../models/Notification');
      const title = 'Stock Updated';
      const message = `Product "${product.name}" (${product.sku}) created with ${initialQty || 0} units stock.`;

      const notification = await Notification.create({
        recipient: req.user._id,
        sender: req.user._id,
        title,
        message,
        type: 'InventoryAlert',
        priority: 'Normal',
      });

      const io = req.app.get('io');
      if (io) {
        const recipientRoom = `user_${req.user._id}`;
        io.to(recipientRoom).to('superadmin').to('admin').emit('new_notification', notification);
      }
    } catch (notifErr) {
      console.error('Failed to create product notification:', notifErr.message);
    }

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update product details
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    product.name = req.body.name || product.name;
    product.sku = req.body.sku || product.sku;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.basePrice = req.body.basePrice || product.basePrice;
    product.images = req.body.images || product.images;
    product.dimensions = req.body.dimensions || product.dimensions;
    product.brand = req.body.brand || product.brand;
    product.material = req.body.material || product.material;
    product.color = req.body.color || product.color;
    product.minOrderQty = req.body.minOrderQty !== undefined ? req.body.minOrderQty : product.minOrderQty;
    product.maxOrderQty = req.body.maxOrderQty !== undefined ? req.body.maxOrderQty : product.maxOrderQty;
    product.leadTimeDays = req.body.leadTimeDays !== undefined ? req.body.leadTimeDays : product.leadTimeDays;
    product.isCustomizable = req.body.isCustomizable !== undefined ? req.body.isCustomizable : product.isCustomizable;
    product.customizationOptions = req.body.customizationOptions || product.customizationOptions;
    product.tags = req.body.tags || product.tags;
    product.vendor = req.body.vendor !== undefined ? req.body.vendor : product.vendor;
    product.hsnCode = req.body.hsnCode !== undefined ? req.body.hsnCode : product.hsnCode;
    product.gstRate = req.body.gstRate !== undefined ? req.body.gstRate : product.gstRate;
    product.status = req.body.status || product.status;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Delete corresponding inventory
    await Inventory.deleteOne({ product: req.params.id });
    await Product.deleteOne({ _id: req.params.id });

    res.json({ message: 'Product and inventory records removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get custom B2B Catalogue for the authenticated Client
// @route   GET /api/products/catalogue/client
// @access  Private
const getClientCatalogue = async (req, res, next) => {
  try {
    const clientId = req.user.client;

    if (!clientId && !['SuperAdmin', 'Admin', 'BDM'].includes(req.user.role)) {
      res.status(400);
      throw new Error('User is not associated with any corporate client');
    }

    // Find custom catalogue for this client
    const targetClientId = req.query.clientId || clientId;
    const catalogue = await Catalogue.findOne({
      client: targetClientId,
      status: { $in: ['Active', 'Pending', 'Draft', 'Approved'] }
    }).populate('products.product');

    if (!catalogue) {
      // Fallback: If no custom catalogue exists, return all products with their base prices
      const products = await Product.find({ status: { $in: ['Available', 'Active'] } });
      const fallbackList = products.map(p => ({
        product: p,
        clientPrice: p.basePrice,
        qtyLimit: 50,
        enabled: true,
      }));
      return res.json({ name: 'Standard Catalogue', budget: 2500, products: fallbackList });
    }

    res.json(catalogue);
  } catch (error) {
    next(error);
  }
};

// @desc    Curate/Save custom pricing catalogue for a client
// @route   POST /api/products/catalogue/curate
// @access  Private/Admin/BDM/CorporateHRManager
const createOrUpdateCatalogue = async (req, res, next) => {
  try {
    const { id, catalogueId, name, description, coverImage, theme, category, client, products, activeFrom, activeTo, budget, employees, isPublished, status } = req.body;

    const targetClient = client || req.user.client;
    const targetCatalogueId = id || catalogueId;

    let catalogue = null;

    // Only update if a specific existing catalogue ID was explicitly provided
    if (targetCatalogueId && mongoose.Types.ObjectId.isValid(targetCatalogueId)) {
      catalogue = await Catalogue.findById(targetCatalogueId);
    }

    if (catalogue) {
      if (name) catalogue.name = name;
      if (budget !== undefined) catalogue.budget = Number(budget);
      if (activeTo !== undefined) catalogue.activeTo = activeTo ? new Date(activeTo) : null;
      if (activeFrom !== undefined) catalogue.activeFrom = activeFrom ? new Date(activeFrom) : null;
      if (products !== undefined) catalogue.products = products;
      if (status) catalogue.status = status;
      if (description !== undefined) catalogue.description = description;
      if (employees !== undefined) catalogue.employees = Number(employees);
      if (category) catalogue.category = category;
      if (theme) catalogue.theme = theme;
      if (coverImage) catalogue.coverImage = coverImage;
      if (isPublished !== undefined) {
        catalogue.isPublished = isPublished;
        if (isPublished && !catalogue.publishedAt) catalogue.publishedAt = new Date();
      }
      await catalogue.save();
    } else {
      // Always create a new, separate catalogue for the client (allows multiple catalogues per company)
      catalogue = await Catalogue.create({
        name: name || 'Annual Employee Catalogue',
        description: description || '',
        coverImage: coverImage || '',
        theme: theme || '',
        category: category || 'General',
        client: targetClient,
        products: products || [],
        activeFrom: activeFrom ? new Date(activeFrom) : null,
        activeTo: activeTo ? new Date(activeTo) : null,
        budget: Number(budget) || 0,
        employees: Number(employees) || 0,
        status: status || 'Pending',
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
        createdBy: req.user._id,
      });
    }

    const populated = await catalogue.populate('client', 'companyName');
    res.status(200).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all catalogues for HR / client admin / SuperAdmin to build/select
// @route   GET /api/products/catalogue/my-catalogues
// @access  Private
const getMyCatalogues = async (req, res, next) => {
  try {
    const clientId = req.user.client;

    if (!clientId && !['SuperAdmin', 'Admin', 'BDM'].includes(req.user.role)) {
      res.status(400);
      throw new Error('User is not associated with any corporate client');
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const isPaginated = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;

    const { search, status, dateFrom, dateTo, from, to } = req.query;

    const baseMatch = {};
    if (clientId) {
      baseMatch.client = new mongoose.Types.ObjectId(clientId);
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
    ];

    if (status && status !== 'All' && status !== 'All statuses') {
      pipeline.push({ $match: { status } });
    }

    if (search && search.trim()) {
      const sRegex = new RegExp(search.trim(), 'i');
      pipeline.push({
        $match: {
          $or: [
            { name: sRegex },
            { theme: sRegex },
            { category: sRegex },
            { 'client.companyName': sRegex },
          ],
        },
      });
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        catalogues: [
          { $sort: { createdAt: -1, _id: -1 } },
          { $skip: skip },
          { $limit: currentLimit },
        ],
        kpis: [
          {
            $group: {
              _id: null,
              totalCatalogues: { $sum: 1 },
              active: {
                $sum: {
                  $cond: [{ $in: ['$status', ['Active', 'Approved']] }, 1, 0],
                },
              },
              pending: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0],
                },
              },
              rejected: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0],
                },
              },
            },
          },
        ],
      },
    });

    const [result] = await Catalogue.aggregate(pipeline);

    const total = result?.metadata?.[0]?.total || 0;
    const catalogues = result?.catalogues || [];
    const kpis = result?.kpis?.[0] || {
      totalCatalogues: total,
      active: 0,
      pending: 0,
      rejected: 0,
    };

    if (!isPaginated) {
      return res.json(catalogues);
    }

    return res.json({
      catalogues,
      data: catalogues,
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

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getClientCatalogue,
  createOrUpdateCatalogue,
  getMyCatalogues,
};

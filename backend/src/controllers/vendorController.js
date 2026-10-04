const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');

// @desc    Get all vendors (with single-pass MongoDB aggregation pipeline & server-side pagination)
// @route   GET /api/vendors
// @access  Private
const getVendors = async (req, res, next) => {
  try {
    if (!['SuperAdmin', 'Admin', 'Procurement', 'AccountsTeam', 'Finance'].includes(req.user.role)) {
      res.status(403);
      throw new Error('Not authorized to access vendor dashboard');
    }

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
          from: 'products',
          localField: 'suppliedProducts',
          foreignField: '_id',
          as: 'suppliedProducts',
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
            { contactPerson: sRegex },
            { email: sRegex },
            { phone: sRegex },
            { paymentTerms: sRegex },
          ],
        },
      });
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        vendors: [
          { $sort: { createdAt: -1, _id: -1 } },
          { $skip: skip },
          { $limit: currentLimit },
        ],
        kpis: [
          {
            $group: {
              _id: null,
              totalVendors: { $sum: 1 },
              active: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Active'] }, 1, 0],
                },
              },
              inactive: {
                $sum: {
                  $cond: [{ $ne: ['$status', 'Active'] }, 1, 0],
                },
              },
            },
          },
        ],
      },
    });

    const [result] = await Vendor.aggregate(pipeline);

    const total = result?.metadata?.[0]?.total || 0;
    const vendors = result?.vendors || [];
    const kpis = result?.kpis?.[0] || {
      totalVendors: total,
      active: 0,
      inactive: 0,
    };

    if (!isPaginated) {
      return res.json(vendors);
    }

    return res.json({
      vendors,
      data: vendors,
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

// @desc    Create a new supplier/vendor
// @route   POST /api/vendors
// @access  Private/Admin
const createVendor = async (req, res, next) => {
  try {
    const { name, contactPerson, email, phone, suppliedProducts, paymentTerms, productsCount, rating, status } = req.body;

    const vendor = await Vendor.create({
      name,
      contactPerson,
      email: email || '',
      phone: phone || '',
      paymentTerms: paymentTerms || 'Net 30',
      productsCount: Number(productsCount) || 0,
      rating: rating !== undefined ? Number(rating) : 4.5,
      status: status || 'Active',
      suppliedProducts: suppliedProducts || [],
    });

    res.status(201).json(vendor);
  } catch (error) {
    next(error);
  }
};

// @desc    Update supplier/vendor
// @route   PUT /api/vendors/:id
// @access  Private/Admin
const updateVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      res.status(404);
      throw new Error('Vendor not found');
    }

    vendor.name = req.body.name || vendor.name;
    vendor.contactPerson = req.body.contactPerson || vendor.contactPerson;
    vendor.email = req.body.email || vendor.email;
    vendor.phone = req.body.phone || vendor.phone;
    vendor.paymentTerms = req.body.paymentTerms || vendor.paymentTerms;
    vendor.productsCount = req.body.productsCount !== undefined ? Number(req.body.productsCount) : vendor.productsCount;
    vendor.suppliedProducts = req.body.suppliedProducts || vendor.suppliedProducts;
    vendor.status = req.body.status || vendor.status;

    const updatedVendor = await vendor.save();
    res.json(updatedVendor);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private/Admin
const deleteVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      res.status(404);
      throw new Error('Vendor not found');
    }

    await Vendor.deleteOne({ _id: req.params.id });
    res.json({ message: 'Vendor removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
};

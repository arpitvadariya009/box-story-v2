const DesignJob = require('../models/DesignJob');
const Order = require('../models/Order');

// @desc    Get all design customisation jobs (with optional pagination & search)
// @route   GET /api/design-jobs
// @access  Private
const getDesignJobs = async (req, res, next) => {
  try {
    let query = {};

    // Filter for assigned designer
    if (req.user.role === 'DesignCustomisation') {
      query.assignedTo = req.user._id;
    }
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [{ jobNumber: searchRegex }, { type: searchRegex }];
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      const skip = (page - 1) * limit;
      const total = await DesignJob.countDocuments(query);
      const jobs = await DesignJob.find(query)
        .populate('order', 'orderNumber status priority')
        .populate('client', 'companyName logo')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.json({
        designJobs: jobs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      });
    }

    const jobs = await DesignJob.find(query)
      .populate('order', 'orderNumber status priority')
      .populate('client', 'companyName logo')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get design job details by ID
// @route   GET /api/design-jobs/:id
// @access  Private
const getDesignJobById = async (req, res, next) => {
  try {
    const job = await DesignJob.findById(req.params.id)
      .populate('order')
      .populate('client')
      .populate('assignedTo', 'name email');

    if (!job) {
      res.status(404);
      throw new Error('Design Job not found');
    }
    res.json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload design proof version
// @route   POST /api/design-jobs/:id/proofs
// @access  Private/Designer
const uploadDesignProof = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    const job = await DesignJob.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Design Job not found');
    }

    const nextVersion = job.proofs.length + 1;
    job.proofs.push({
      version: nextVersion,
      imageUrl,
      status: 'Pending',
      uploadedAt: new Date(),
    });

    job.status = 'Proof Sent';
    const updatedJob = await job.save();

    res.status(201).json(updatedJob);
  } catch (error) {
    next(error);
  }
};

// @desc    Review design proof (Approve/Reject)
// @route   PUT /api/design-jobs/:id/proofs/:proofId
// @access  Private
const reviewDesignProof = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;
    const job = await DesignJob.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Design Job not found');
    }

    const proof = job.proofs.id(req.params.proofId);
    if (!proof) {
      res.status(404);
      throw new Error('Design proof version not found');
    }

    proof.status = status;
    proof.feedback = feedback || '';
    proof.reviewedBy = req.user._id;
    proof.reviewedAt = new Date();

    if (status === 'Approved') {
      job.status = 'Approved';
      // Sync status back to corresponding order
      const order = await Order.findById(job.order);
      if (order) {
        order.status = 'Design Approved';
        await order.save();
      }
    } else {
      job.status = 'Revision Requested';
      const order = await Order.findById(job.order);
      if (order) {
        order.status = 'In Design';
        await order.save();
      }
    }

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDesignJobs,
  getDesignJobById,
  uploadDesignProof,
  reviewDesignProof,
};

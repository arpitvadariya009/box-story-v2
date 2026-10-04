const User = require('../models/User');
const Client = require('../models/Client');
const AuditLog = require('../models/AuditLog');
const { generateStrongPassword } = require('../utils/passwordGenerator');
const { sendUserInvitationEmail } = require('../utils/emailService');

// @desc    Get all users (High-Performance MongoDB Aggregation Pipeline with Facet)
// @route   GET /api/users
// @access  Private/Admin/CorporateHRManager
const getUsers = async (req, res, next) => {
  try {
    const match = {};
    if (req.user.role === 'CorporateHRManager') {
      match.client = req.user.client;
      match.role = 'Employee';
    } else if (req.query.role && req.query.role !== 'All') {
      match.role = req.query.role;
    }

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

    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      match.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { department: searchRegex },
        { role: searchRegex },
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
          users: [
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
                from: 'users',
                localField: 'managedBy',
                foreignField: '_id',
                as: 'managedBy',
                pipeline: [{ $project: { name: 1, email: 1 } }],
              },
            },
            { $unwind: { path: '$managedBy', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                role: 1,
                status: 1,
                phone: 1,
                department: 1,
                employeeId: 1,
                client: 1,
                managedBy: 1,
                lastLogin: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ],
        },
      },
    ];

    const [result] = await User.aggregate(pipeline);
    const total = result?.metadata?.[0]?.total || 0;
    const users = result?.users || [];

    if (!req.query.page && !req.query.limit) {
      return res.json(users);
    }

    return res.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / Invite a new user
// @route   POST /api/users
// @access  Private/Admin/CorporateHRManager
const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      client,
      phone,
      department,
      employeeId,
      permissions,
      managedBy,
      status,
    } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User email already exists');
    }

    const targetClient = req.user?.role === 'CorporateHRManager' ? req.user.client : client;
    const targetRole = req.user?.role === 'CorporateHRManager' ? 'Employee' : (role || 'Employee');

    // Automatically generate strong 8-character password if not provided
    const rawPassword = password && password.trim().length > 0 ? password.trim() : generateStrongPassword(8);

    const user = await User.create({
      name,
      email,
      password: rawPassword,
      role: targetRole,
      client: targetClient || null,
      phone: phone || '',
      department: department || '',
      budget: req.body.budget || 2500,
      employeeId: employeeId || '',
      permissions: permissions || [],
      managedBy: managedBy || null,
      status: status || 'Active',
    });

    // Send invitation email with credentials to user's email
    const loginUrl = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173';
    const emailResult = await sendUserInvitationEmail({
      name: user.name,
      email: user.email,
      password: rawPassword,
      role: user.role,
      loginUrl,
    });

    // Record Audit Log for user invite/creation
    try {
      if (req.user?._id) {
        await AuditLog.create({
          user: req.user._id,
          action: 'Create',
          model: 'User',
          documentId: user._id.toString(),
          description: `Invited user ${user.name} (${user.email}) as ${user.role}. Email dispatch: ${emailResult.success ? 'Success' : 'Failed'}`,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
          userAgent: req.headers['user-agent'] || '',
        });
      }
    } catch (auditErr) {
      console.warn('Could not record invite audit log:', auditErr.message);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      client: user.client,
      phone: user.phone,
      department: user.department,
      budget: user.budget,
      employeeId: user.employeeId,
      permissions: user.permissions,
      status: user.status,
      emailSent: emailResult.success,
      emailError: emailResult.error || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile / role / status
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.status = req.body.status || user.status;
    user.client = req.body.client !== undefined ? req.body.client : user.client;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.department = req.body.department !== undefined ? req.body.department : user.department;
    user.budget = req.body.budget !== undefined ? req.body.budget : user.budget;
    user.employeeId = req.body.employeeId !== undefined ? req.body.employeeId : user.employeeId;
    user.permissions = req.body.permissions !== undefined ? req.body.permissions : user.permissions;
    user.managedBy = req.body.managedBy !== undefined ? req.body.managedBy : user.managedBy;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      client: updatedUser.client,
      phone: updatedUser.phone,
      department: updatedUser.department,
      budget: updatedUser.budget,
      employeeId: updatedUser.employeeId,
      permissions: updatedUser.permissions,
      status: updatedUser.status,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs (with single-pass MongoDB aggregation pipeline & server-side pagination)
// @route   GET /api/users/audit/logs
// @access  Private/Admin
const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const isPaginated = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;

    const { search, action, status, from, to, dateFrom, dateTo } = req.query;

    const baseMatch = {};

    // Action/Status filter
    const actionVal = action || status;
    if (actionVal && actionVal !== 'All' && actionVal !== 'All statuses') {
      baseMatch.action = actionVal;
    }

    // Date range filter
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
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          action: 1,
          model: 1,
          documentId: 1,
          changes: 1,
          description: 1,
          ipAddress: 1,
          userAgent: 1,
          createdAt: 1,
          updatedAt: 1,
          user: {
            _id: '$userDetails._id',
            name: '$userDetails.name',
            email: '$userDetails.email',
            role: '$userDetails.role',
          },
        },
      },
    ];

    // Search filter across user name, email, action, model, description, ipAddress
    if (search && search.trim()) {
      const sRegex = new RegExp(search.trim(), 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'user.name': sRegex },
            { 'user.email': sRegex },
            { action: sRegex },
            { model: sRegex },
            { description: sRegex },
            { ipAddress: sRegex },
          ],
        },
      });
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        logs: [
          { $sort: { createdAt: -1, _id: -1 } },
          { $skip: skip },
          { $limit: currentLimit },
        ],
      },
    });

    const [result] = await AuditLog.aggregate(pipeline);

    const total = result?.metadata?.[0]?.total || 0;
    const logs = result?.logs || [];

    if (!isPaginated) {
      return res.json(logs);
    }

    return res.json({
      logs,
      data: logs,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(total / currentLimit) || 1,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getAuditLogs,
};

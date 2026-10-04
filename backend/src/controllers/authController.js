const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, client, phone, department, employeeId } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Employee',
      client: client || null,
      phone: phone || '',
      department: department || '',
      employeeId: employeeId || '',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        client: user.client,
        phone: user.phone,
        department: user.department,
        employeeId: user.employeeId,
        permissions: user.permissions,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('client');

    if (user && (await user.matchPassword(password))) {
      if (user.status !== 'Active') {
        res.status(403);
        throw new Error(`Your account status is: ${user.status}`);
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Record audit log
      try {
        await AuditLog.create({
          user: user._id,
          action: 'Login',
          model: 'User',
          description: `User ${user.name} logged in successfully`,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
          userAgent: req.headers['user-agent'] || '',
        });
      } catch (logErr) {
        console.warn('Could not record login audit log:', logErr.message);
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        client: user.client,
        phone: user.phone,
        department: user.department,
        employeeId: user.employeeId,
        avatar: user.avatar,
        permissions: user.permissions,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('client');
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        client: user.client,
        phone: user.phone,
        department: user.department,
        employeeId: user.employeeId,
        avatar: user.avatar,
        permissions: user.permissions,
        status: user.status,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

const { sendPasswordResetOtpEmail } = require('../utils/emailService');

// @desc    Forgot password (send OTP via email)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error('Please provide an email address');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      res.status(404);
      throw new Error('User not found with this email address');
    }

    // Generate 6-digit OTP and hash on user
    const otp = user.generateResetOtp();
    await user.save({ validateBeforeSave: false });

    // Send OTP email via Nodemailer
    const emailResult = await sendPasswordResetOtpEmail({
      name: user.name,
      email: user.email,
      otp,
    });

    res.json({
      success: true,
      message: 'OTP has been sent to your email address',
      email: user.email,
      emailSent: emailResult.success,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password-otp
// @access  Public
const resetPasswordWithOtp = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      res.status(400);
      throw new Error('Email, OTP code, and new password are required');
    }

    const hashedOtp = crypto
      .createHash('sha256')
      .update(otp.toString().trim())
      .digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired OTP code. Please try again.');
    }

    // Set new password
    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password (token-based legacy)
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    // Hash token to match with saved token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired reset password token');
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      message: 'Password reset successful. You can now login with your new password.',
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.avatar = req.body.avatar || user.avatar;
      
      // Email is unique, check if changed
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          res.status(400);
          throw new Error('Email already in use');
        }
        user.email = req.body.email;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        department: updatedUser.department,
        employeeId: updatedUser.employeeId,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(400);
      throw new Error('Invalid current password');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPasswordWithOtp,
  resetPassword,
  updateProfile,
  changePassword,
};

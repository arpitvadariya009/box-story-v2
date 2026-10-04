const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        'SuperAdmin',
        'Admin',
        'BDM',
        'Procurement',
        'WarehouseLogistics',
        'DesignCustomisation',
        'DataEntryOperator',
        'AccountsTeam',
        'CorporateHRManager',
        'Employee',
      ],
      default: 'Employee',
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    budget: {
      type: Number,
      default: 2500,
    },
    employeeId: {
      type: String,
      default: '',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      default: null,
    },
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    permissions: {
      type: [String],
      default: [],
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    resetPasswordOtp: String,
    resetPasswordOtpExpire: Date,
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1, status: 1, createdAt: -1 });
userSchema.index({ client: 1, role: 1, createdAt: -1 });
userSchema.index({ name: 'text', email: 'text', employeeId: 'text' });

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash 6-digit password reset OTP
userSchema.methods.generateResetOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP and store in resetPasswordOtp
  this.resetPasswordOtp = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;

  return otp;
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;

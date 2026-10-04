const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token and attach to req.user (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user not found'));
      }

      if (req.user.status !== 'Active') {
        res.status(403);
        return next(new Error(`User account is ${req.user.status}`));
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      return next(new Error('Not authorized, token failed'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token'));
  }
};

// Grant access to specific roles
// SuperAdmin automatically gets access to everything
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized, user not found'));
    }

    if (req.user.role === 'SuperAdmin') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`User role '${req.user.role}' is not authorized to access this route`));
    }
    next();
  };
};

// Grant access based on permissions
const authorizePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized, user not found'));
    }

    if (req.user.role === 'SuperAdmin') {
      return next();
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      res.status(403);
      return next(new Error(`User does not have the required permission: '${permission}'`));
    }
    next();
  };
};

module.exports = { protect, authorize, authorizePermission };

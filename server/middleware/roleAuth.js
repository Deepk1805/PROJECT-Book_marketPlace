const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Check if user has required role
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      // Get token from header
      const token = req.header('x-auth-token');
      
      if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      
      // Get user with role
      const user = await User.findById(decoded.user.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ msg: 'User not found' });
      }

      // Check if user has required role (treat legacy 'user' role as 'buyer')
      const userRole = user.role === 'user' ? 'buyer' : user.role;

      if (Array.isArray(roles)) {
        if (!roles.includes(userRole)) {
          return res.status(403).json({ msg: 'Access denied. Insufficient permissions.' });
        }
      } else {
        if (userRole !== roles) {
          return res.status(403).json({ msg: 'Access denied. Insufficient permissions.' });
        }
      }

      req.user = { id: user._id, role: user.role };
      next();
    } catch (err) {
      console.error('Role auth error:', err);
      res.status(401).json({ msg: 'Token is not valid' });
    }
  };
};

// Specific role middlewares
const requireAdmin = requireRole('admin');
const requireSeller = requireRole(['seller', 'admin']);
const requireLibrarian = requireRole(['librarian', 'admin']);
const requireSellerOrAdmin = requireRole(['seller', 'admin']);

module.exports = {
  requireRole,
  requireAdmin,
  requireSeller,
  requireLibrarian,
  requireSellerOrAdmin
};

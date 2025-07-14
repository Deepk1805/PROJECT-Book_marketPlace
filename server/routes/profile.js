const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleAuth');
const User = require('../models/User');
const Book = require('../models/Book');

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('wishlist')
      .populate('readingList.book');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Update user profile
router.put('/me', [auth, [
  check('name', 'Name is required').optional().not().isEmpty(),
  check('email', 'Please include a valid email').optional().isEmail(),
  check('phone', 'Phone number is invalid').optional().isMobilePhone()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      email,
      phone,
      address,
      profile
    } = req.body;

    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (email) profileFields.email = email;
    if (phone) profileFields.phone = phone;
    if (address) profileFields.address = address;
    if (profile) profileFields.profile = profile;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Get user by ID (public profile)
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -email -phone -address -wishlist -readingList');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Get user's books for sale
    const books = await Book.find({ 
      seller: req.params.userId, 
      status: 'available' 
    }).limit(10);

    res.json({
      user,
      books,
      bookCount: books.length
    });
  } catch (err) {
    console.error('Get user profile error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Update user role (admin only)
router.put('/:userId/role', [requireAdmin, [
  check('role', 'Role is required').isIn(['buyer', 'seller', 'admin', 'librarian'])
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ msg: 'User role updated successfully', user });
  } catch (err) {
    console.error('Update user role error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Get all users (admin only)
router.get('/', [requireAdmin], async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Get user dashboard stats
router.get('/me/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Get user's books
    const userBooks = await Book.find({ seller: req.user.id });
    const availableBooks = userBooks.filter(book => book.status === 'available');
    const soldBooks = userBooks.filter(book => book.status === 'sold');

    // Calculate stats
    const stats = {
      profile: {
        name: user.name,
        role: user.role,
        memberSince: user.createdAt
      },
      books: {
        total: userBooks.length,
        available: availableBooks.length,
        sold: soldBooks.length,
        totalViews: userBooks.reduce((sum, book) => sum + book.stats.views, 0)
      },
      wishlist: {
        count: user.wishlist.length
      },
      readingList: {
        total: user.readingList.length,
        wantToRead: user.readingList.filter(item => item.status === 'want-to-read').length,
        currentlyReading: user.readingList.filter(item => item.status === 'currently-reading').length,
        read: user.readingList.filter(item => item.status === 'read').length
      }
    };

    // Add seller-specific stats
    if (user.role === 'seller' || user.role === 'admin') {
      stats.seller = {
        totalSales: user.sellerStats.totalSales,
        totalRevenue: user.sellerStats.totalRevenue,
        rating: user.sellerStats.rating,
        reviewCount: user.sellerStats.reviewCount
      };
    }

    res.json(stats);
  } catch (err) {
    console.error('Get dashboard stats error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Book = require('../models/Book');

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'wishlist',
        populate: {
          path: 'seller',
          select: 'name email'
        }
      });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user.wishlist);
  } catch (err) {
    console.error('Get wishlist error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Add book to wishlist
router.post('/add/:bookId', auth, async (req, res) => {
  try {
    const { bookId } = req.params;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if book is already in wishlist
    if (user.wishlist.includes(bookId)) {
      return res.status(400).json({ msg: 'Book already in wishlist' });
    }

    // Add to wishlist
    user.wishlist.push(bookId);
    await user.save();

    // Update book stats
    book.stats.wishlistCount += 1;
    await book.save();

    res.json({ msg: 'Book added to wishlist' });
  } catch (err) {
    console.error('Add to wishlist error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Remove book from wishlist
router.delete('/remove/:bookId', auth, async (req, res) => {
  try {
    const { bookId } = req.params;

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if book is in wishlist
    const bookIndex = user.wishlist.indexOf(bookId);
    if (bookIndex === -1) {
      return res.status(400).json({ msg: 'Book not in wishlist' });
    }

    // Remove from wishlist
    user.wishlist.splice(bookIndex, 1);
    await user.save();

    // Update book stats
    const book = await Book.findById(bookId);
    if (book && book.stats.wishlistCount > 0) {
      book.stats.wishlistCount -= 1;
      await book.save();
    }

    res.json({ msg: 'Book removed from wishlist' });
  } catch (err) {
    console.error('Remove from wishlist error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Check if book is in user's wishlist
router.get('/check/:bookId', auth, async (req, res) => {
  try {
    const { bookId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isInWishlist = user.wishlist.includes(bookId);
    res.json({ isInWishlist });
  } catch (err) {
    console.error('Check wishlist error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

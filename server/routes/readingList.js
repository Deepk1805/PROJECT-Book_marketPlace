const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Book = require('../models/Book');

// Get user's reading list
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query; // Filter by status: want-to-read, currently-reading, read

    const user = await User.findById(req.user.id)
      .populate({
        path: 'readingList.book',
        populate: {
          path: 'seller',
          select: 'name email'
        }
      });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    let readingList = user.readingList;

    // Filter by status if provided
    if (status) {
      readingList = readingList.filter(item => item.status === status);
    }

    // Sort by date added (newest first)
    readingList.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

    res.json(readingList);
  } catch (err) {
    console.error('Get reading list error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Add book to reading list
router.post('/add/:bookId', [auth, [
  check('status', 'Status is required').isIn(['want-to-read', 'currently-reading', 'read'])
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { bookId } = req.params;
    const { status, rating, review } = req.body;

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

    // Check if book is already in reading list
    const existingEntry = user.readingList.find(item => 
      item.book.toString() === bookId
    );

    if (existingEntry) {
      return res.status(400).json({ msg: 'Book already in reading list' });
    }

    // Create reading list entry
    const readingListEntry = {
      book: bookId,
      status,
      dateAdded: new Date()
    };

    // Set dates based on status
    if (status === 'currently-reading') {
      readingListEntry.dateStarted = new Date();
    } else if (status === 'read') {
      readingListEntry.dateStarted = new Date();
      readingListEntry.dateFinished = new Date();
      if (rating) readingListEntry.rating = rating;
      if (review) readingListEntry.review = review;
    }

    // Add to reading list
    user.readingList.push(readingListEntry);
    await user.save();

    // Update book stats
    book.stats.readingListCount += 1;
    await book.save();

    res.json({ msg: 'Book added to reading list', entry: readingListEntry });
  } catch (err) {
    console.error('Add to reading list error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Update reading list entry
router.put('/update/:bookId', [auth, [
  check('status', 'Status is required').isIn(['want-to-read', 'currently-reading', 'read'])
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { bookId } = req.params;
    const { status, rating, review } = req.body;

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Find reading list entry
    const entryIndex = user.readingList.findIndex(item => 
      item.book.toString() === bookId
    );

    if (entryIndex === -1) {
      return res.status(404).json({ msg: 'Book not found in reading list' });
    }

    const entry = user.readingList[entryIndex];
    const oldStatus = entry.status;

    // Update status
    entry.status = status;

    // Update dates based on status changes
    if (status === 'currently-reading' && oldStatus === 'want-to-read') {
      entry.dateStarted = new Date();
    } else if (status === 'read' && oldStatus !== 'read') {
      if (!entry.dateStarted) entry.dateStarted = new Date();
      entry.dateFinished = new Date();
    }

    // Update rating and review for completed books
    if (status === 'read') {
      if (rating) entry.rating = rating;
      if (review) entry.review = review;
    }

    await user.save();

    res.json({ msg: 'Reading list entry updated', entry });
  } catch (err) {
    console.error('Update reading list error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Remove book from reading list
router.delete('/remove/:bookId', auth, async (req, res) => {
  try {
    const { bookId } = req.params;

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Find and remove entry
    const entryIndex = user.readingList.findIndex(item => 
      item.book.toString() === bookId
    );

    if (entryIndex === -1) {
      return res.status(404).json({ msg: 'Book not found in reading list' });
    }

    user.readingList.splice(entryIndex, 1);
    await user.save();

    // Update book stats
    const book = await Book.findById(bookId);
    if (book && book.stats.readingListCount > 0) {
      book.stats.readingListCount -= 1;
      await book.save();
    }

    res.json({ msg: 'Book removed from reading list' });
  } catch (err) {
    console.error('Remove from reading list error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Get reading statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const stats = {
      totalBooks: user.readingList.length,
      wantToRead: user.readingList.filter(item => item.status === 'want-to-read').length,
      currentlyReading: user.readingList.filter(item => item.status === 'currently-reading').length,
      read: user.readingList.filter(item => item.status === 'read').length,
      averageRating: 0,
      totalReviews: 0
    };

    const ratedBooks = user.readingList.filter(item => item.rating);
    if (ratedBooks.length > 0) {
      const totalRating = ratedBooks.reduce((sum, item) => sum + item.rating, 0);
      stats.averageRating = (totalRating / ratedBooks.length).toFixed(1);
    }

    stats.totalReviews = user.readingList.filter(item => item.review).length;

    res.json(stats);
  } catch (err) {
    console.error('Get reading stats error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

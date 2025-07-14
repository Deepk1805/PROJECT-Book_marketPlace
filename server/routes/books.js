const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const { requireSeller } = require('../middleware/roleAuth');
const bookMetadataService = require('../services/bookMetadata');

// Get all books with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      genre,
      condition,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { status: 'available' };

    if (category) filter.category = category;
    if (genre) filter.genres = { $in: [genre] };
    if (condition) filter.condition = condition;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { authors: { $in: [new RegExp(search, 'i')] } },
        { description: { $regex: search, $options: 'i' } },
        { 'metadata.isbn': { $regex: search, $options: 'i' } },
        { 'metadata.isbn13': { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const books = await Book.find(filter)
      .populate('seller', ['name', 'email', 'sellerStats'])
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Book.countDocuments(filter);

    res.json({
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('seller', ['name', 'email', 'sellerStats', 'profile']);

    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Increment view count
    book.stats.views += 1;
    await book.save();

    res.json(book);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Create a book
router.post('/', [auth, [
  check('title', 'Title is required').not().isEmpty(),
  check('author', 'Author is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('price', 'Price is required').isNumeric(),
  check('condition', 'Condition is required').isIn(['New', 'Like New', 'Good', 'Fair', 'Poor']),
  check('category', 'Category is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Enrich book data with external metadata
    const enrichedData = await bookMetadataService.enrichBookData(req.body);

    const newBook = new Book({
      ...enrichedData,
      seller: req.user.id
    });

    const book = await newBook.save();

    // Populate seller info before returning
    await book.populate('seller', ['name', 'email']);

    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a book
router.put('/:id', auth, async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Make sure user owns the book
    if (book.seller.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    book = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(book);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Delete a book
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Make sure user owns the book
    if (book.seller.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await book.remove();
    res.json({ msg: 'Book removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Search external book databases
router.get('/search/external', async (req, res) => {
  try {
    const { query, source = 'google' } = req.query;

    if (!query) {
      return res.status(400).json({ msg: 'Search query is required' });
    }

    let results = [];

    if (source === 'google' || source === 'all') {
      const googleResults = await bookMetadataService.searchGoogleBooks(query);
      results = results.concat(googleResults.map(item => ({
        ...bookMetadataService.formatGoogleBookData(item),
        source: 'google'
      })));
    }

    if (source === 'openlibrary' || source === 'all') {
      const openLibraryResults = await bookMetadataService.searchOpenLibrary(query);
      results = results.concat(openLibraryResults.map(item => ({
        title: item.title,
        authors: item.author_name || [],
        publishedDate: item.first_publish_year,
        isbn: item.isbn?.[0] || '',
        source: 'openlibrary'
      })));
    }

    res.json(results);
  } catch (err) {
    console.error('External search error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Get book by ISBN
router.get('/isbn/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;

    // First check if we have it in our database
    const existingBook = await Book.findOne({
      $or: [
        { 'metadata.isbn': isbn },
        { 'metadata.isbn13': isbn }
      ]
    }).populate('seller', ['name', 'email']);

    if (existingBook) {
      return res.json({ book: existingBook, source: 'local' });
    }

    // If not found locally, search external APIs
    const bookData = await bookMetadataService.getBookByISBN(isbn);

    if (bookData) {
      res.json({ book: bookData, source: 'external' });
    } else {
      res.status(404).json({ msg: 'Book not found' });
    }
  } catch (err) {
    console.error('ISBN lookup error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Get book categories and genres
router.get('/metadata/categories', async (req, res) => {
  try {
    const categories = await Book.distinct('category');
    const genres = await Book.distinct('genres');

    res.json({ categories, genres });
  } catch (err) {
    console.error('Get categories error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
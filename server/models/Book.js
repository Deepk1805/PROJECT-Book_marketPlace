const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  authors: [String], // Multiple authors support
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor']
  },
  category: {
    type: String,
    required: true
  },
  genres: [String], // Multiple genres
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: 'default-book.jpg'
  },
  images: [String], // Multiple images
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  // Rich metadata from external APIs
  metadata: {
    isbn: String,
    isbn13: String,
    googleBooksId: String,
    openLibraryId: String,
    publishedDate: String,
    publisher: String,
    pageCount: Number,
    language: { type: String, default: 'en' },
    format: {
      type: String,
      enum: ['hardcover', 'paperback', 'ebook', 'audiobook'],
      default: 'paperback'
    },
    dimensions: {
      height: String,
      width: String,
      thickness: String
    },
    weight: String,
    edition: String,
    series: String,
    volume: Number
  },
  // External ratings and reviews
  externalRatings: {
    googleBooks: {
      rating: Number,
      reviewCount: Number
    },
    goodreads: {
      rating: Number,
      reviewCount: Number
    }
  },
  // Local ratings and reviews
  localRatings: {
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  // Book statistics
  stats: {
    views: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    readingListCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema); 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin', 'librarian', 'user'], // Keep 'user' for backward compatibility
    default: 'buyer'
  },
  profile: {
    bio: String,
    avatar: String,
    preferences: {
      favoriteGenres: [String],
      language: { type: String, default: 'en' },
      notifications: {
        email: { type: Boolean, default: true },
        wishlistUpdates: { type: Boolean, default: true },
        newBooks: { type: Boolean, default: false }
      }
    }
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  readingList: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    status: {
      type: String,
      enum: ['want-to-read', 'currently-reading', 'read'],
      default: 'want-to-read'
    },
    dateAdded: {
      type: Date,
      default: Date.now
    },
    dateStarted: Date,
    dateFinished: Date,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String
  }],
  sellerStats: {
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 
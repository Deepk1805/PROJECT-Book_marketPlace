const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Book = require('../models/Book');

// Create payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { bookId, shippingAddress } = req.body;

    // Get book details
    const book = await Book.findById(bookId).populate('seller');
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Check if book is still available
    if (book.status !== 'available') {
      return res.status(400).json({ msg: 'Book is no longer available' });
    }

    // Create order
    const order = new Order({
      book: bookId,
      buyer: req.user.id,
      seller: book.seller._id,
      amount: book.price * 100, // Convert to cents for Stripe
      shippingAddress
    });
    await order.save();

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: book.price * 100,
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        bookId: bookId,
        buyerId: req.user.id,
        sellerId: book.seller._id.toString()
      }
    });

    // Update order with payment intent ID
    order.paymentIntentId = paymentIntent.id;
    await order.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order._id
    });
  } catch (err) {
    console.error('Payment intent error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Webhook to handle successful payments
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    try {
      // Update order status
      const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
      if (order) {
        order.paymentStatus = 'completed';
        order.orderStatus = 'processing';
        await order.save();

        // Update book status
        const book = await Book.findById(order.book);
        if (book) {
          book.status = 'sold';
          await book.save();
        }
      }
    } catch (err) {
      console.error('Error processing successful payment:', err);
    }
  }

  res.json({ received: true });
});

// Get order status
router.get('/order/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('book')
      .populate('seller', ['name', 'email']);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if user is the buyer
    if (order.buyer.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 
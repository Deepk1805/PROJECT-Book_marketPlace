import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
} from '@mui/material';
import CheckoutForm from './CheckoutForm';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const Checkout = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookAndCreatePaymentIntent = async () => {
      try {
        // Fetch book details
        const bookRes = await axios.get(`http://localhost:5000/api/books/${bookId}`);
        setBook(bookRes.data);

        // Create payment intent
        const token = localStorage.getItem('token');
        const paymentRes = await axios.post(
          'http://localhost:5000/api/payment/create-payment-intent',
          {
            bookId,
            shippingAddress: {} // Will be updated during checkout
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            }
          }
        );

        setClientSecret(paymentRes.data.clientSecret);
        setOrderId(paymentRes.data.orderId);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error initializing checkout');
        setLoading(false);
      }
    };

    fetchBookAndCreatePaymentIntent();
  }, [bookId]);

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container>
        <Typography>Book not found</Typography>
      </Container>
    );
  }

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#1976d2',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <img
                src={book.image || 'https://via.placeholder.com/200x300'}
                alt={book.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              {book.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              by {book.author}
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              ${book.price}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Condition: {book.condition}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm orderId={orderId} amount={book.price * 100} />
          </Elements>
        )}
      </Paper>
    </Container>
  );
};

export default Checkout; 
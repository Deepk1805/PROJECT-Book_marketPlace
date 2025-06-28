import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `http://localhost:5000/api/payment/order/${orderId}`,
          {
            headers: {
              'x-auth-token': token,
            },
          }
        );
        setOrder(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error fetching order details');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

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

  if (!order) {
    return (
      <Container>
        <Typography>Order not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <SuccessIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Order Confirmed!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Thank you for your purchase
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <img
              src={order.book.image || 'https://via.placeholder.com/200x300'}
              alt={order.book.title}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
              }}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              {order.book.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              by {order.book.author}
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              ${(order.amount / 100).toFixed(2)}
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Chip
                icon={<PaymentIcon />}
                label={`Payment Status: ${order.paymentStatus}`}
                color={order.paymentStatus === 'completed' ? 'success' : 'default'}
                sx={{ mr: 1, mb: 1 }}
              />
              <Chip
                icon={<ShippingIcon />}
                label={`Order Status: ${order.orderStatus}`}
                color="primary"
                sx={{ mb: 1 }}
              />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Shipping Details
          </Typography>
          <Typography>
            {order.shippingAddress.street}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
            <br />
            {order.shippingAddress.country}
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Seller Information
          </Typography>
          <Typography>
            {order.seller.name}
            <br />
            {order.seller.email}
          </Typography>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/books')}
          >
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderConfirmation; 
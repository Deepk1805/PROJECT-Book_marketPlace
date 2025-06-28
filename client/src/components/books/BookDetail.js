import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import {
  LocalOffer as PriceIcon,
  Book as BookIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/books/${id}`);
        setBook(res.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching book details');
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleContact = () => {
    // In a real application, this would open a chat or messaging interface
    alert(`Contact ${book.seller.name} about "${book.title} to ${book.contact}"`);
  };

  const handleBuyNow = () => {
    navigate(`/checkout/${book._id}`);
  };

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <img
              src={book.image || 'https://via.placeholder.com/300x400'}
              alt={book.title}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
              }}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {book.title}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon /> {book.author}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PriceIcon /> ${book.price}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Chip
                icon={<BookIcon />}
                label={`Condition: ${book.condition}`}
                sx={{ mr: 1 }}
              />
              <Chip
                icon={<CategoryIcon />}
                label={`Category: ${book.category}`}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography paragraph>
              {book.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Seller Information
              </Typography>
              <Typography>
                {book.seller.name}
              </Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    startIcon={<CartIcon />}
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={handleContact}
                  >
                    Contact Seller
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/books')}
                  >
                    Back to Books
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default BookDetail; 
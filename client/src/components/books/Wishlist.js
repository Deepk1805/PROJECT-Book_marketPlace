import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as CartIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };

      const res = await axios.get('/api/wishlist', config);
      setWishlist(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error fetching wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };

      await axios.delete(`/api/wishlist/remove/${bookId}`, config);
      setWishlist(wishlist.filter(book => book._id !== bookId));
    } catch (err) {
      setError(err.response?.data?.msg || 'Error removing from wishlist');
    }
  };

  const addToReadingList = async (bookId, status = 'want-to-read') => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      };

      await axios.post(`/api/reading-list/add/${bookId}`, { status }, config);
      alert('Book added to reading list!');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error adding to reading list');
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Wishlist
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {wishlist.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            Your wishlist is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Start adding books you'd like to read or buy!
          </Typography>
          <Button
            component={Link}
            to="/books"
            variant="contained"
            color="primary"
          >
            Browse Books
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {wishlist.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={book.image || '/default-book.jpg'}
                  alt={book.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {book.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    by {book.author}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    ${book.price}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Chip
                      label={book.condition}
                      size="small"
                      color="secondary"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={book.category}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Seller: {book.seller?.name}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    component={Link}
                    to={`/books/${book._id}`}
                    size="small"
                    startIcon={<ViewIcon />}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    startIcon={<CartIcon />}
                    onClick={() => addToReadingList(book._id)}
                  >
                    Add to Reading List
                  </Button>
                  <IconButton
                    onClick={() => removeFromWishlist(book._id)}
                    color="error"
                    size="small"
                  >
                    <FavoriteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Wishlist;

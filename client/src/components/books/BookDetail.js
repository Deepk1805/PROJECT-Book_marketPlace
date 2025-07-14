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
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Rating,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  LocalOffer as PriceIcon,
  Book as BookIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  MenuBook as ReadingIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Star as StarIcon
} from '@mui/icons-material';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [readingDialog, setReadingDialog] = useState(false);
  const [readingData, setReadingData] = useState({
    status: 'want-to-read',
    rating: 0,
    review: ''
  });

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`/api/books/${id}`);
        setBook(res.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching book details');
        setLoading(false);
      }
    };

    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const config = {
            headers: {
              'x-auth-token': token,
            },
          };
          const res = await axios.get(`/api/wishlist/check/${id}`, config);
          setIsInWishlist(res.data.isInWishlist);
        }
      } catch (err) {
        console.error('Error checking wishlist status:', err);
      }
    };

    fetchBook();
    checkWishlistStatus();
  }, [id]);

  const handleContact = () => {
    // In a real application, this would open a chat or messaging interface
    alert(`Contact ${book.seller.name} about "${book.title}"`);
  };

  const handleBuyNow = () => {
    navigate(`/checkout/${book._id}`);
  };

  const toggleWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          'x-auth-token': token,
        },
      };

      if (isInWishlist) {
        await axios.delete(`/api/wishlist/remove/${id}`, config);
        setIsInWishlist(false);
      } else {
        await axios.post(`/api/wishlist/add/${id}`, {}, config);
        setIsInWishlist(true);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Error updating wishlist');
    }
  };

  const handleAddToReadingList = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      };

      await axios.post(`/api/reading-list/add/${id}`, readingData, config);
      setReadingDialog(false);
      setReadingData({ status: 'want-to-read', rating: 0, review: '' });
      alert('Book added to reading list!');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error adding to reading list');
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const openReadingDialog = () => {
    setReadingDialog(true);
    handleMenuClose();
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
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
                <Grid item xs={12} sm={3}>
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
                <Grid item xs={12} sm={3}>
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
                <Grid item xs={12} sm={3}>
                  <Button
                    variant="outlined"
                    color={isInWishlist ? "error" : "secondary"}
                    size="large"
                    fullWidth
                    startIcon={isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    onClick={toggleWishlist}
                  >
                    {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box display="flex" alignItems="center">
                    <Button
                      variant="outlined"
                      color="success"
                      size="large"
                      startIcon={<ReadingIcon />}
                      onClick={openReadingDialog}
                      sx={{ flexGrow: 1 }}
                    >
                      Add to Reading List
                    </Button>
                    <IconButton
                      onClick={handleMenuClick}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={openReadingDialog}>
          <ReadingIcon sx={{ mr: 1 }} />
          Add to Reading List
        </MenuItem>
        <MenuItem onClick={toggleWishlist}>
          {isInWishlist ? <FavoriteIcon sx={{ mr: 1 }} /> : <FavoriteBorderIcon sx={{ mr: 1 }} />}
          {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </MenuItem>
      </Menu>

      {/* Reading List Dialog */}
      <Dialog open={readingDialog} onClose={() => setReadingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add to Reading List</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={readingData.status}
                label="Status"
                onChange={(e) => setReadingData({ ...readingData, status: e.target.value })}
              >
                <MenuItem value="want-to-read">Want to Read</MenuItem>
                <MenuItem value="currently-reading">Currently Reading</MenuItem>
                <MenuItem value="read">Read</MenuItem>
              </Select>
            </FormControl>

            {readingData.status === 'read' && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography component="legend">Rating</Typography>
                  <Rating
                    value={readingData.rating}
                    onChange={(event, newValue) => {
                      setReadingData({ ...readingData, rating: newValue });
                    }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Review"
                  multiline
                  rows={4}
                  value={readingData.review}
                  onChange={(e) => setReadingData({ ...readingData, review: e.target.value })}
                  placeholder="Write your review..."
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReadingDialog(false)}>Cancel</Button>
          <Button onClick={handleAddToReadingList} variant="contained">
            Add to Reading List
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookDetail; 
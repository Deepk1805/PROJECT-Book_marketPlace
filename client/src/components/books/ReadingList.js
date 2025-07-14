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
  Tabs,
  Tab,
  Rating,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

const ReadingList = () => {
  const [readingList, setReadingList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [editDialog, setEditDialog] = useState({ open: false, book: null });
  const [editData, setEditData] = useState({
    status: '',
    rating: 0,
    review: ''
  });

  const statusTabs = [
    { label: 'All', value: '' },
    { label: 'Want to Read', value: 'want-to-read' },
    { label: 'Currently Reading', value: 'currently-reading' },
    { label: 'Read', value: 'read' }
  ];

  useEffect(() => {
    fetchReadingList();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [readingList, currentTab]);

  const fetchReadingList = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };

      const res = await axios.get('/api/reading-list', config);
      setReadingList(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error fetching reading list');
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    const status = statusTabs[currentTab].value;
    if (status === '') {
      setFilteredList(readingList);
    } else {
      setFilteredList(readingList.filter(item => item.status === status));
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const openEditDialog = (item) => {
    setEditData({
      status: item.status,
      rating: item.rating || 0,
      review: item.review || ''
    });
    setEditDialog({ open: true, book: item });
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, book: null });
    setEditData({ status: '', rating: 0, review: '' });
  };

  const updateReadingListItem = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      };

      await axios.put(
        `/api/reading-list/update/${editDialog.book.book._id}`,
        editData,
        config
      );

      fetchReadingList();
      closeEditDialog();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error updating reading list');
    }
  };

  const removeFromReadingList = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };

      await axios.delete(`/api/reading-list/remove/${bookId}`, config);
      setReadingList(readingList.filter(item => item.book._id !== bookId));
    } catch (err) {
      setError(err.response?.data?.msg || 'Error removing from reading list');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'want-to-read': return 'primary';
      case 'currently-reading': return 'warning';
      case 'read': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'want-to-read': return 'Want to Read';
      case 'currently-reading': return 'Currently Reading';
      case 'read': return 'Read';
      default: return status;
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
        My Reading List
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          {statusTabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {filteredList.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No books in this category
          </Typography>
          <Button
            component={Link}
            to="/books"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Browse Books
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredList.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.book._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.book.image || '/default-book.jpg'}
                  alt={item.book.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {item.book.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    by {item.book.author}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={getStatusLabel(item.status)}
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                  </Box>
                  {item.rating && (
                    <Box sx={{ mb: 1 }}>
                      <Rating value={item.rating} readOnly size="small" />
                    </Box>
                  )}
                  {item.review && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      "{item.review}"
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" display="block">
                    Added: {new Date(item.dateAdded).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    component={Link}
                    to={`/books/${item.book._id}`}
                    size="small"
                    startIcon={<ViewIcon />}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => openEditDialog(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={() => removeFromReadingList(item.book._id)}
                  >
                    Remove
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update Reading Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={editData.status}
                label="Status"
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              >
                <MenuItem value="want-to-read">Want to Read</MenuItem>
                <MenuItem value="currently-reading">Currently Reading</MenuItem>
                <MenuItem value="read">Read</MenuItem>
              </Select>
            </FormControl>

            {editData.status === 'read' && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography component="legend">Rating</Typography>
                  <Rating
                    value={editData.rating}
                    onChange={(event, newValue) => {
                      setEditData({ ...editData, rating: newValue });
                    }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Review"
                  multiline
                  rows={4}
                  value={editData.review}
                  onChange={(e) => setEditData({ ...editData, review: e.target.value })}
                  placeholder="Write your review..."
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button onClick={updateReadingListItem} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReadingList;

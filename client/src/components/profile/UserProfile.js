import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Avatar,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Book as BookIcon,
  Favorite as FavoriteIcon,
  MenuBook as ReadingIcon,
  Star as StarIcon
} from '@mui/icons-material';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    profile: {
      bio: '',
      preferences: {
        favoriteGenres: [],
        language: 'en',
        notifications: {
          email: true,
          wishlistUpdates: true,
          newBooks: false
        }
      }
    }
  });

  const genres = [
    'Fiction', 'Non-Fiction', 'Science', 'Technology', 'Arts', 'History',
    'Biography', 'Mystery', 'Romance', 'Fantasy', 'Science Fiction',
    'Horror', 'Thriller', 'Self-Help', 'Business', 'Health', 'Travel'
  ];

  useEffect(() => {
    fetchProfile();
    fetchDashboard();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };

      const res = await axios.get('/api/profile/me', config);
      setProfile(res.data);
      setEditData({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        address: res.data.address || {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        profile: {
          bio: res.data.profile?.bio || '',
          preferences: {
            favoriteGenres: res.data.profile?.preferences?.favoriteGenres || [],
            language: res.data.profile?.preferences?.language || 'en',
            notifications: {
              email: res.data.profile?.preferences?.notifications?.email ?? true,
              wishlistUpdates: res.data.profile?.preferences?.notifications?.wishlistUpdates ?? true,
              newBooks: res.data.profile?.preferences?.notifications?.newBooks ?? false
            }
          }
        }
      });
    } catch (err) {
      setError(err.response?.data?.msg || 'Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };

      const res = await axios.get('/api/profile/me/dashboard', config);
      setDashboard(res.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      };

      await axios.put('/api/profile/me', editData, config);
      setEditDialog(false);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error updating profile');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'seller': return 'primary';
      case 'librarian': return 'secondary';
      case 'buyer': return 'default';
      default: return 'default';
    }
  };

  const getRoleLabel = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
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
        My Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                <Avatar
                  sx={{ width: 80, height: 80, mb: 2 }}
                  src={profile?.profile?.avatar}
                >
                  {profile?.name?.charAt(0)}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {profile?.name}
                </Typography>
                <Chip
                  label={getRoleLabel(profile?.role)}
                  color={getRoleColor(profile?.role)}
                  size="small"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText primary={profile?.email} />
                </ListItem>
                {profile?.phone && (
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText primary={profile?.phone} />
                  </ListItem>
                )}
                {profile?.address?.city && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${profile.address.city}, ${profile.address.state}`} 
                    />
                  </ListItem>
                )}
              </List>

              {profile?.profile?.bio && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Bio
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profile.profile.bio}
                  </Typography>
                </Box>
              )}

              {profile?.profile?.preferences?.favoriteGenres?.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Favorite Genres
                  </Typography>
                  <Box>
                    {profile.profile.preferences.favoriteGenres.map((genre) => (
                      <Chip
                        key={genre}
                        label={genre}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => setEditDialog(true)}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Dashboard Stats */}
        <Grid item xs={12} md={8}>
          {dashboard && (
            <Grid container spacing={2}>
              {/* Books Stats */}
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <BookIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">My Books</Typography>
                    </Box>
                    <Typography variant="h4" color="primary">
                      {dashboard.books.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dashboard.books.available} available, {dashboard.books.sold} sold
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dashboard.books.totalViews} total views
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Wishlist Stats */}
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <FavoriteIcon color="error" sx={{ mr: 1 }} />
                      <Typography variant="h6">Wishlist</Typography>
                    </Box>
                    <Typography variant="h4" color="error">
                      {dashboard.wishlist.count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Books you want to read
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Reading List Stats */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <ReadingIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="h6">Reading Progress</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="primary">
                            {dashboard.readingList.wantToRead}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Want to Read
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="warning.main">
                            {dashboard.readingList.currentlyReading}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Currently Reading
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="success.main">
                            {dashboard.readingList.read}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Read
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Seller Stats (if applicable) */}
              {dashboard.seller && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <StarIcon color="warning" sx={{ mr: 1 }} />
                        <Typography variant="h6">Seller Performance</Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <Box textAlign="center">
                            <Typography variant="h5" color="success.main">
                              {dashboard.seller.totalSales}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Sales
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box textAlign="center">
                            <Typography variant="h5" color="success.main">
                              ${dashboard.seller.totalRevenue}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Revenue
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box textAlign="center">
                            <Typography variant="h5" color="warning.main">
                              {dashboard.seller.rating}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Rating
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box textAlign="center">
                            <Typography variant="h5" color="info.main">
                              {dashboard.seller.reviewCount}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Reviews
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={editData.profile.preferences.language}
                  label="Language"
                  onChange={(e) => setEditData({
                    ...editData,
                    profile: {
                      ...editData.profile,
                      preferences: {
                        ...editData.profile.preferences,
                        language: e.target.value
                      }
                    }
                  })}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                multiline
                rows={3}
                value={editData.profile.bio}
                onChange={(e) => setEditData({
                  ...editData,
                  profile: {
                    ...editData.profile,
                    bio: e.target.value
                  }
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Address
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street"
                value={editData.address.street}
                onChange={(e) => setEditData({
                  ...editData,
                  address: { ...editData.address, street: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={editData.address.city}
                onChange={(e) => setEditData({
                  ...editData,
                  address: { ...editData.address, city: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={editData.address.state}
                onChange={(e) => setEditData({
                  ...editData,
                  address: { ...editData.address, state: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Zip Code"
                value={editData.address.zipCode}
                onChange={(e) => setEditData({
                  ...editData,
                  address: { ...editData.address, zipCode: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Notification Preferences
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={editData.profile.preferences.notifications.email}
                    onChange={(e) => setEditData({
                      ...editData,
                      profile: {
                        ...editData.profile,
                        preferences: {
                          ...editData.profile.preferences,
                          notifications: {
                            ...editData.profile.preferences.notifications,
                            email: e.target.checked
                          }
                        }
                      }
                    })}
                  />
                }
                label="Email notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editData.profile.preferences.notifications.wishlistUpdates}
                    onChange={(e) => setEditData({
                      ...editData,
                      profile: {
                        ...editData.profile,
                        preferences: {
                          ...editData.profile.preferences,
                          notifications: {
                            ...editData.profile.preferences.notifications,
                            wishlistUpdates: e.target.checked
                          }
                        }
                      }
                    })}
                  />
                }
                label="Wishlist updates"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editData.profile.preferences.notifications.newBooks}
                    onChange={(e) => setEditData({
                      ...editData,
                      profile: {
                        ...editData.profile,
                        preferences: {
                          ...editData.profile.preferences,
                          notifications: {
                            ...editData.profile.preferences.notifications,
                            newBooks: e.target.checked
                          }
                        }
                      }
                    })}
                  />
                }
                label="New book notifications"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateProfile} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile;

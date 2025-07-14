import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  MenuBook as ReadingIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';

const Navbar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    handleMenuClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          📚 Book Marketplace
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/books"
          >
            Browse Books
          </Button>

          {isLoggedIn ? (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/add-book"
              >
                Sell Book
              </Button>
              <IconButton
                color="inherit"
                component={RouterLink}
                to="/wishlist"
                title="Wishlist"
              >
                <FavoriteIcon />
              </IconButton>
              <IconButton
                color="inherit"
                component={RouterLink}
                to="/reading-list"
                title="Reading List"
              >
                <ReadingIcon />
              </IconButton>
              <IconButton
                color="inherit"
                onClick={handleMenuClick}
                title="Profile"
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  <PersonIcon />
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  My Profile
                </MenuItem>
                <MenuItem onClick={() => { navigate('/wishlist'); handleMenuClose(); }}>
                  <FavoriteIcon sx={{ mr: 1 }} />
                  Wishlist
                </MenuItem>
                <MenuItem onClick={() => { navigate('/reading-list'); handleMenuClose(); }}>
                  <ReadingIcon sx={{ mr: 1 }} />
                  Reading List
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
              >
                Login
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/register"
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 
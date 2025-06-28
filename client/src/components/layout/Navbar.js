import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';

const Navbar = () => {
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
          Book Marketplace
        </Typography>
        <Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/books"
          >
            Browse Books
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/add-book"
          >
            Sell Book
          </Button>
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
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
} from '@mui/material';

const Home = () => {
  return (
    <Container>
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            backgroundColor: 'primary.main',
            color: 'white',
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Book Marketplace
          </Typography>
          <Typography variant="h5" paragraph>
            Buy and sell books with ease
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={RouterLink}
                to="/books"
              >
                Browse Books
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                component={RouterLink}
                to="/add-book"
              >
                Sell Your Books
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Why Choose Us?
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Wide Selection
              </Typography>
              <Typography>
                Browse through thousands of books across various categories and conditions.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Secure Transactions
              </Typography>
              <Typography>
                Buy and sell with confidence using our secure platform.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Great Deals
              </Typography>
              <Typography>
                Find the best prices on used and new books from trusted sellers.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home; 
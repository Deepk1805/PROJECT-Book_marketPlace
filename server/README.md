# Book Marketplace Server

This is the backend server for the Book Marketplace application built with Node.js, Express, and MongoDB.

## Features

- User authentication (JWT)
- Book CRUD operations
- Payment processing with Stripe
- MongoDB database integration
- CORS enabled for frontend communication

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create new book (authenticated)
- `PUT /api/books/:id` - Update book (authenticated)
- `DELETE /api/books/:id` - Delete book (authenticated)

### Payment
- `POST /api/payment/create-payment-intent` - Create payment intent
- `POST /api/payment/webhook` - Stripe webhook handler

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
MONGODB_URI=mongodb://localhost:27017/bookmarketplace
JWT_SECRET=your_jwt_secret_key
PORT=5001
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Running the Server

```bash
npm install
npm start
```

The server will run on http://localhost:5001

# Book Marketplace

A full-stack web application for buying and selling books. Built with React.js, Node.js, Express, and MongoDB.

## Features

- User authentication (register/login)
- Browse books with filtering and search
- List books for sale
- View detailed book information
- Contact sellers
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd book-marketplace
```

2. Install server dependencies:

```bash
cd server
npm install
```

3. Install client dependencies:

```bash
cd ../client
npm install
```

4. Create a `.env` file in the server directory with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/bookmarketplace
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Running the Application

1. Start the MongoDB service on your system

2. Start the server:

```bash
cd server
npm start
```

3. In a new terminal, start the client:

```bash
cd client
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Books

- GET `/api/books` - Get all books
- GET `/api/books/:id` - Get book by ID
- POST `/api/books` - Create a new book listing (requires authentication)
- PUT `/api/books/:id` - Update a book listing (requires authentication)
- DELETE `/api/books/:id` - Delete a book listing (requires authentication)

## Technologies Used

### Frontend

- React.js
- Material-UI
- React Router
- Axios

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

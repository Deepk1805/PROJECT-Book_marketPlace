# Book Marketplace

A full-stack web application for buying and selling books. Built with React.js, Node.js, Express, and MongoDB.

> **Latest Update (July 8, 2025)**: User registration functionality has been fixed and improved with comprehensive error handling and validation. Complete project structure with all standard files added.

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

4. Set up environment variables:

```bash
cd server
cp .env.example .env
```

Edit the `.env` file with your configuration:

```
MONGODB_URI=mongodb://localhost:27017/bookmarketplace
JWT_SECRET=your_jwt_secret_key_here_change_in_production
PORT=5001
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

5. Make sure MongoDB is running:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

## Running the Application

1. Start the MongoDB service on your system

2. Start the server:

```bash
cd server
npm start
```

The server will run on `http://localhost:5001`

3. In a new terminal, start the client:

```bash
cd client
npm start
```

The client will run on `http://localhost:3000` (or `http://localhost:3001` if 3000 is busy)

4. Open your browser and navigate to the client URL displayed in the terminal

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

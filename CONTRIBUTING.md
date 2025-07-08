# Contributing to Book Marketplace

Thank you for your interest in contributing to the Book Marketplace project!

## Development Setup

1. Clone the repository
2. Install dependencies for both client and server
3. Set up environment variables
4. Start MongoDB
5. Run the development servers

## Project Structure

```
book-marketplace/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── books/     # Book-related components
│   │   │   ├── layout/    # Layout components
│   │   │   ├── pages/     # Page components
│   │   │   ├── payment/   # Payment components
│   │   │   └── routing/   # Routing components
│   │   ├── App.js         # Main App component
│   │   └── index.js       # Entry point
│   ├── package.json       # Client dependencies
│   └── README.md          # Client documentation
├── server/                # Node.js backend
│   ├── middleware/        # Express middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── server.js         # Server entry point
│   ├── .env.example      # Environment template
│   └── package.json      # Server dependencies
├── README.md             # Main project documentation
└── CONTRIBUTING.md       # This file
```

## Code Style

- Use consistent indentation (2 spaces)
- Follow React best practices
- Use meaningful variable names
- Add comments for complex logic

## Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## Reporting Issues

Please use the GitHub issue tracker to report bugs or request features.

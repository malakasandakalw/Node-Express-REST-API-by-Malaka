# node-express-api-by-malaka

> Built by **Malaka Sandakal**

Professional Express.js REST API with MongoDB, JWT auth, and security middleware.

## Project Structure

```
src/
├── config/
│   ├── index.js          # Centralized config from env vars
│   └── db.js             # MongoDB connection
├── middleware/
│   ├── errorHandler.js   # AppError class, asyncHandler, global error handler
│   ├── auth.js           # JWT authenticate + role-based authorize
│   └── validate.js       # Zod validation middleware + schemas
├── models/
│   ├── User.js           # User schema (password hashing, comparison)
│   └── Product.js        # Product schema with indexes
├── services/
│   ├── authService.js    # Register, login, profile logic
│   └── productService.js # Product CRUD + filtering/pagination
├── controllers/
│   ├── authController.js    # Thin HTTP layer — calls services
│   └── productController.js # Thin HTTP layer — calls services
├── routes/
│   ├── index.js          # Central route registry
│   ├── authRoutes.js     # /api/v1/auth/*
│   └── productRoutes.js  # /api/v1/products/*
├── app.js                # Express setup, middleware, routes
└── server.js             # DB connect, server.listen, graceful shutdown
tests/
└── product.test.js       # Integration tests with supertest
```

## Setup

```bash
npm install
cp .env.example .env      # fill in your values
npm run dev
```

## API Endpoints

### Auth

| Method | Endpoint              | Access  | Description       |
| ------ | --------------------- | ------- | ----------------- |
| POST   | /api/v1/auth/register | Public  | Register new user |
| POST   | /api/v1/auth/login    | Public  | Login, get token  |
| GET    | /api/v1/auth/me       | Private | Get own profile   |

### Products

| Method | Endpoint             | Access  | Description          |
| ------ | -------------------- | ------- | -------------------- |
| GET    | /api/v1/products     | Public  | List all (paginated) |
| GET    | /api/v1/products/:id | Public  | Get one product      |
| POST   | /api/v1/products     | Private | Create product       |
| PUT    | /api/v1/products/:id | Private | Update product       |
| DELETE | /api/v1/products/:id | Private | Delete product       |

### Query params for GET /api/v1/products

```
?page=1&limit=10&sort=-createdAt
?category=electronics
?minPrice=100&maxPrice=500
?search=laptop
```

## Request Examples

### Register

```json
POST /api/v1/auth/register
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "Password1"
}
```

### Create Product (Authorization: Bearer <token>)

```json
POST /api/v1/products
{
  "name": "MacBook Pro",
  "description": "Powerful laptop for developers",
  "price": 1999.99,
  "category": "electronics",
  "stock": 5
}
```

## Security Features

- `helmet` — secure HTTP headers
- `cors` — controlled cross-origin access
- `express-rate-limit` — global + per-route rate limiting
- `express-mongo-sanitize` — NoSQL injection prevention
- `bcryptjs` — password hashing (cost factor 12)
- JWT authentication with role-based authorization
- Zod input validation on all write endpoints
- Request body size limit (10kb)

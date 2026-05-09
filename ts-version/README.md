# node-express-api-by-malaka

> Built by **Malaka Sandakal**

Professional Express.js REST API with MongoDB, JWT auth, and security middleware.

## Project Structure

```
src/
├── types/
│   └── index.ts              # Shared interfaces and types
├── config/
│   ├── index.ts              # Centralized config from env vars
│   └── db.ts                 # MongoDB connection
├── middleware/
│   ├── errorHandler.ts       # AppError class, asyncHandler, global error handler
│   ├── auth.ts               # JWT authenticate + role-based authorize
│   └── validate.ts           # Zod validation middleware + schemas
├── models/
│   ├── User.ts               # User schema (password hashing, comparison)
│   └── Product.ts            # Product schema with indexes
├── services/
│   ├── authService.ts        # Register, login, profile logic
│   └── productService.ts     # Product CRUD + filtering/pagination
├── controllers/
│   ├── authController.ts     # Thin HTTP layer — calls auth services
│   └── productController.ts  # Thin HTTP layer — calls product services
├── routes/
│   ├── index.ts              # Central route registry + health check
│   ├── authRoutes.ts         # /api/v1/auth/*
│   └── productRoutes.ts      # /api/v1/products/*
├── app.ts                    # Express setup, middleware, routes
└── server.ts                 # DB connect, server.listen, graceful shutdown
```

## Setup

```bash
npm install
cp .env.example .env        # fill in your MongoDB URI and JWT secret
npm run dev                 # development with hot reload (ts-node-dev)
npm run build               # compile TypeScript → dist/
npm start                   # run compiled output
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

### Login

```json
POST /api/v1/auth/login
{
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

## Key TypeScript Concepts Used

- `AuthRequest` extends Express `Request` with `user?: IUserDocument` — allows typed access to `req.user` in controllers
- `req.user!` — non-null assertion used after authenticate middleware guarantees user exists
- `ZodSchema` typed validate middleware — catches bad input before it reaches business logic
- `Promise<void>` return types on all async middleware and controllers
- Interfaces defined once in `src/types/index.ts` and imported everywhere

## Security Features

- `helmet` — secure HTTP headers
- `cors` — controlled cross-origin access
- `express-rate-limit` — global + stricter per-route limits
- `express-mongo-sanitize` — NoSQL injection prevention
- `bcryptjs` — password hashing (cost factor 12)
- JWT authentication with role-based authorization
- Zod input validation on all write endpoints
- Request body size limit (10kb)

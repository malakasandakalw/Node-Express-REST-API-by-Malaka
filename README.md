# node-express-api-by-malaka

A professional REST API boilerplate built with **Node.js** and **Express.js**, available in both JavaScript and TypeScript versions.

> Built by [Malaka Sandakal](https://github.com/malakasandakalw)

---

## Overview

This boilerplate provides a clean, scalable foundation for building REST APIs. It follows a layered architecture pattern with routes, controllers, and services clearly separated. Both versions are functionally identical, the TypeScript version adds full type safety on top.

---

## Versions

| | JavaScript | TypeScript |
|---|---|---|
| Folder | `js-version/` | `ts-version/` |
| Syntax | CommonJS (`require`) | ES Modules (`import`) |
| Type safety | No | Yes |
| Compilation | Not needed | `tsc` → `dist/` |
| Run dev | `npm run dev` | `npm run dev` |

---

## Features

- **Express.js** - fast, minimal web framework
- **MongoDB + Mongoose** - database with schema validation
- **JWT Authentication** - register, login, protected routes
- **Role-based Authorization** - user and admin roles
- **Zod Validation** - request body validation with clear error messages
- **Global Error Handling** - centralized error middleware with custom `AppError` class
- **Security** - `helmet`, `cors`, `express-rate-limit`, `express-mongo-sanitize`
- **Layered Architecture** - routes → controllers → services → models

---

## Project Structure

Both versions follow the same structure:

```
src/
├── config/         Database connection and environment config
├── middleware/     Error handler, JWT auth, Zod validation
├── models/         Mongoose schemas (User, Product)
├── services/       Business logic (auth, product CRUD)
├── controllers/    HTTP request/response handling
├── routes/         Route definitions
└── app.ts/js       Express app setup
server.ts/js        Entry point
```

---

## Getting Started

**1. Clone the repo**
```bash
git clone https://github.com/malakasandakalw/Node-Express-REST-API-by-Malaka.git
cd Node-Express-REST-API-by-Malaka
```

**2. Choose a version**
```bash
cd js-version
# or
cd ts-version
```

**3. Install dependencies**
```bash
npm install
```

**4. Set up environment variables**
```bash
cp .env.example .env
```

Then open `.env` and fill in your values:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/express_api
JWT_SECRET=your_secret_key_here
```

**5. Run the development server**
```bash
npm run dev
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/register` | Public | Register new user |
| POST | `/api/v1/auth/login` | Public | Login and get token |
| GET | `/api/v1/auth/me` | Private | Get own profile |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/products` | Public | Get all products |
| GET | `/api/v1/products/:id` | Public | Get one product |
| POST | `/api/v1/products` | Private | Create product |
| PUT | `/api/v1/products/:id` | Private | Update product |
| DELETE | `/api/v1/products/:id` | Private | Delete product |

### Health Check
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/health` | Public | API status |

---

## Request Examples

**Register**
```json
POST /api/v1/auth/register
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "Password1"
}
```

**Login**
```json
POST /api/v1/auth/login
{
  "email": "alice@example.com",
  "password": "Password1"
}
```

**Create Product** — requires `Authorization: Bearer <token>`
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

---

## Adding a New CRUD Resource

This section shows you exactly how to add a new resource to the app using **Order** as an example. Follow these 5 steps in order every time.

---

### Step 1 - Create the Model

Create `src/models/Order.js` (or `Order.ts`):

**JavaScript**
```js
// src/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
```

**TypeScript** - add the interface to `src/types/index.ts` first:
```ts
// Add to src/types/index.ts
export interface IOrder {
  product: Types.ObjectId;
  user: Types.ObjectId;
  quantity: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalPrice: number;
}

export interface IOrderDocument extends IOrder, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

Then create `src/models/Order.ts`:
```ts
// src/models/Order.ts
import mongoose, { Schema } from 'mongoose';
import { IOrderDocument } from '../types';

const orderSchema = new Schema<IOrderDocument>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrderDocument>('Order', orderSchema);
```

---

### Step 2 - Add Validation Schemas

Add your Zod schemas inside `src/middleware/validate.js` (or `validate.ts`):

**JavaScript**
```js
// Add inside src/middleware/validate.js
const createOrderSchema = z.object({
  product:    z.string().min(1, 'Product ID is required'),
  quantity:   z.number().int().min(1, 'Quantity must be at least 1'),
  totalPrice: z.number().positive('Total price must be a positive number'),
});

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
});

// Add to module.exports
module.exports = {
  // ...existing exports
  createOrderSchema,
  updateOrderSchema,
};
```

**TypeScript**
```ts
// Add inside src/middleware/validate.ts
export const createOrderSchema = z.object({
  product:    z.string().min(1, 'Product ID is required'),
  quantity:   z.number().int().min(1, 'Quantity must be at least 1'),
  totalPrice: z.number().positive('Total price must be a positive number'),
});

export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
});
```

---

### Step 3 - Create the Service

Create `src/services/orderService.js` (or `orderService.ts`) — all business logic lives here:

**JavaScript**
```js
// src/services/orderService.js
const Order = require('../models/Order');
const { AppError } = require('../middleware/errorHandler');

const getAllOrders = async (userId, role) => {
  // Admins see all orders, regular users see only their own
  const filter = role === 'admin' ? {} : { user: userId };
  return await Order.find(filter)
    .populate('product', 'name price')
    .populate('user', 'name email')
    .sort('-createdAt');
};

const getOrderById = async (id, userId, role) => {
  const order = await Order.findById(id)
    .populate('product', 'name price')
    .populate('user', 'name email');

  if (!order) throw new AppError('Order not found.', 404);

  const isOwner = order.user._id.toString() === userId.toString();
  if (!isOwner && role !== 'admin') {
    throw new AppError('You do not have permission to view this order.', 403);
  }

  return order;
};

const createOrder = async (data, userId) => {
  return await Order.create({ ...data, user: userId });
};

const updateOrder = async (id, data, role) => {
  const order = await Order.findById(id);
  if (!order) throw new AppError('Order not found.', 404);

  if (role !== 'admin') {
    throw new AppError('Only admins can update order status.', 403);
  }

  return await Order.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

const deleteOrder = async (id, userId, role) => {
  const order = await Order.findById(id);
  if (!order) throw new AppError('Order not found.', 404);

  const isOwner = order.user.toString() === userId.toString();
  if (!isOwner && role !== 'admin') {
    throw new AppError('You do not have permission to delete this order.', 403);
  }

  await order.deleteOne();
};

module.exports = { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder };
```

**TypeScript**
```ts
// src/services/orderService.ts
import Order from '../models/Order';
import { AppError } from '../middleware/errorHandler';
import { Types } from 'mongoose';

export const getAllOrders = async (userId: Types.ObjectId, role: string) => {
  const filter = role === 'admin' ? {} : { user: userId };
  return await Order.find(filter)
    .populate('product', 'name price')
    .populate('user', 'name email')
    .sort('-createdAt');
};

export const getOrderById = async (
  id: string,
  userId: Types.ObjectId,
  role: string
) => {
  const order = await Order.findById(id)
    .populate('product', 'name price')
    .populate('user', 'name email');

  if (!order) throw new AppError('Order not found.', 404);

  const isOwner = order.user.toString() === userId.toString();
  if (!isOwner && role !== 'admin') {
    throw new AppError('You do not have permission to view this order.', 403);
  }

  return order;
};

export const createOrder = async (data: any, userId: Types.ObjectId) => {
  return await Order.create({ ...data, user: userId });
};

export const updateOrder = async (id: string, data: any, role: string) => {
  const order = await Order.findById(id);
  if (!order) throw new AppError('Order not found.', 404);

  if (role !== 'admin') {
    throw new AppError('Only admins can update order status.', 403);
  }

  return await Order.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteOrder = async (
  id: string,
  userId: Types.ObjectId,
  role: string
) => {
  const order = await Order.findById(id);
  if (!order) throw new AppError('Order not found.', 404);

  const isOwner = order.user.toString() === userId.toString();
  if (!isOwner && role !== 'admin') {
    throw new AppError('You do not have permission to delete this order.', 403);
  }

  await order.deleteOne();
};
```

---

### Step 4 - Create the Controller

Create `src/controllers/orderController.js` (or `orderController.ts`) keep it thin, just call the service:

**JavaScript**
```js
// src/controllers/orderController.js
const orderService = require('../services/orderService');
const { asyncHandler } = require('../middleware/errorHandler');

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getAllOrders(req.user._id, req.user.role);
  res.status(200).json({ success: true, data: orders });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(
    req.params.id,
    req.user._id,
    req.user.role
  );
  res.status(200).json({ success: true, data: order });
});

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body, req.user._id);
  res.status(201).json({
    success: true,
    message: 'Order placed successfully.',
    data: order,
  });
});

const updateOrder = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrder(
    req.params.id,
    req.body,
    req.user.role
  );
  res.status(200).json({
    success: true,
    message: 'Order updated successfully.',
    data: order,
  });
});

const deleteOrder = asyncHandler(async (req, res) => {
  await orderService.deleteOrder(req.params.id, req.user._id, req.user.role);
  res.status(200).json({ success: true, message: 'Order deleted successfully.' });
});

module.exports = { getAllOrders, getOrder, createOrder, updateOrder, deleteOrder };
```

**TypeScript**
```ts
// src/controllers/orderController.ts
import { Response } from 'express';
import * as orderService from '../services/orderService';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const getAllOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const orders = await orderService.getAllOrders(req.user!._id, req.user!.role);
  res.status(200).json({ success: true, data: orders });
});

export const getOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await orderService.getOrderById(
    req.params.id,
    req.user!._id,
    req.user!.role
  );
  res.status(200).json({ success: true, data: order });
});

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await orderService.createOrder(req.body, req.user!._id);
  res.status(201).json({
    success: true,
    message: 'Order placed successfully.',
    data: order,
  });
});

export const updateOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await orderService.updateOrder(
    req.params.id,
    req.body,
    req.user!.role
  );
  res.status(200).json({
    success: true,
    message: 'Order updated successfully.',
    data: order,
  });
});

export const deleteOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  await orderService.deleteOrder(req.params.id, req.user!._id, req.user!.role);
  res.status(200).json({ success: true, message: 'Order deleted successfully.' });
});
```

---

### Step 5 - Create the Routes and Register

Create `src/routes/orderRoutes.js` (or `orderRoutes.ts`):

**JavaScript**
```js
// src/routes/orderRoutes.js
const router = require('express').Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { validate, createOrderSchema, updateOrderSchema } = require('../middleware/validate');

// All order routes require authentication
router.use(authenticate);

router.get('/',     orderController.getAllOrders);
router.get('/:id',  orderController.getOrder);
router.post('/',    validate(createOrderSchema), orderController.createOrder);
router.put('/:id',  validate(updateOrderSchema), orderController.updateOrder);
router.delete('/:id',                            orderController.deleteOrder);

module.exports = router;
```

**TypeScript**
```ts
// src/routes/orderRoutes.ts
import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authenticate } from '../middleware/auth';
import { validate, createOrderSchema, updateOrderSchema } from '../middleware/validate';

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.get('/',     orderController.getAllOrders);
router.get('/:id',  orderController.getOrder);
router.post('/',    validate(createOrderSchema), orderController.createOrder);
router.put('/:id',  validate(updateOrderSchema), orderController.updateOrder);
router.delete('/:id',                            orderController.deleteOrder);

export default router;
```

Finally, register it in `src/routes/index.js` (or `index.ts`):

**JavaScript**
```js
// src/routes/index.js
router.use('/auth',     require('./authRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/orders',   require('./orderRoutes'));  // add this line
```

**TypeScript**
```ts
// src/routes/index.ts
import orderRoutes from './orderRoutes';

router.use('/auth',     authRoutes);
router.use('/products', productRoutes);
router.use('/orders',   orderRoutes);  // add this line
```

---

### Summary — Files to Create per Resource

Every time you add a new resource, create these files in order:

| Step | File | What it does |
|------|------|--------------|
| 1 | `models/Order.js` | Defines DB schema and shape |
| 2 | `middleware/validate.js` | Adds Zod schemas for validation |
| 3 | `services/orderService.js` | All business logic |
| 4 | `controllers/orderController.js` | Handles req/res, calls service |
| 5 | `routes/orderRoutes.js` | Maps URLs to controller functions |
| 5 | `routes/index.js` | Registers the new route |

> The pattern is always the same, model → validation → service → controller → route. Follow this order every time and your codebase stays consistent and clean.

---

## Tech Stack

| Package | Purpose |
|---|---|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT auth |
| `bcryptjs` | Password hashing |
| `zod` | Request validation |
| `helmet` | Security headers |
| `cors` | Cross-origin requests |
| `express-rate-limit` | Rate limiting |
| `express-mongo-sanitize` | NoSQL injection prevention |
| `morgan` | HTTP request logging |
| `dotenv` | Environment variables |

---

## Author

**Malaka Sandakal**

- GitHub: [@malakasandakalw](https://github.com/malakasandakalw)
- LinkedIn: [malakasandakal](https://www.linkedin.com/in/malakasandakal/)

---

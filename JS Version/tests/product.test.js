const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Product = require('../src/models/Product');

let token;
let userId;

// Connect to test DB before all tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/express_api_test');

  // Create a test user and get token
  const res = await request(app).post('/api/v1/auth/register').send({
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password1',
  });

  token = res.body.data.token;
  userId = res.body.data.user._id;
});

// Clean up after all tests
afterAll(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await mongoose.connection.close();
});

describe('Product API', () => {
  let productId;

  const productData = {
    name: 'Test Laptop',
    description: 'A great laptop for testing purposes',
    price: 999.99,
    category: 'electronics',
    stock: 10,
  };

  it('GET /api/v1/products — returns empty list', async () => {
    const res = await request(app).get('/api/v1/products').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('POST /api/v1/products — 401 without token', async () => {
    await request(app).post('/api/v1/products').send(productData).expect(401);
  });

  it('POST /api/v1/products — creates product with token', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(productData.name);
    productId = res.body.data._id;
  });

  it('GET /api/v1/products/:id — returns product', async () => {
    const res = await request(app)
      .get(`/api/v1/products/${productId}`)
      .expect(200);
    expect(res.body.data._id).toBe(productId);
  });

  it('PUT /api/v1/products/:id — updates product', async () => {
    const res = await request(app)
      .put(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 1099.99 })
      .expect(200);

    expect(res.body.data.price).toBe(1099.99);
  });

  it('DELETE /api/v1/products/:id — deletes product', async () => {
    await request(app)
      .delete(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('GET /api/v1/products/:id — 404 after deletion', async () => {
    await request(app).get(`/api/v1/products/${productId}`).expect(404);
  });
});

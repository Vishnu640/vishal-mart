const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('./app');

let mongoServer, adminToken, userToken;

const adminUser = { name: 'Admin', email: 'admin@test.com', password: 'Admin123' };
const normalUser = { name: 'User', email: 'user@test.com', password: 'User1234' };
const sampleProduct = { name: 'Test Apple', category: 'Fruits', price: 50, stock: 100 };

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  process.env.JWT_SECRET = 'test_secret';

  // Register users then promote admin directly in DB
  await request(app).post('/api/auth/register').send(adminUser);
  await request(app).post('/api/auth/register').send(normalUser);

  const User = require('../models/User');
  await User.findOneAndUpdate({ email: adminUser.email }, { role: 'admin' });

  const adminRes = await request(app).post('/api/auth/login').send({ email: adminUser.email, password: adminUser.password });
  const userRes  = await request(app).post('/api/auth/login').send({ email: normalUser.email, password: normalUser.password });
  adminToken = adminRes.body.data.token;
  userToken  = userRes.body.data.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await mongoose.connection.db.collection('products').deleteMany({});
});

describe('GET /api/products', () => {
  it('returns empty list when no products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns all products', async () => {
    await request(app).post('/api/products').set('Authorization', `Bearer ${adminToken}`).send(sampleProduct);
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe(sampleProduct.name);
  });

  it('is accessible without authentication', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
  });
});

describe('POST /api/products', () => {
  it('admin can create a product', async () => {
    const res = await request(app).post('/api/products').set('Authorization', `Bearer ${adminToken}`).send(sampleProduct);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe(sampleProduct.name);
    expect(res.body.data.price).toBe(sampleProduct.price);
  });

  it('rejects creation without auth', async () => {
    const res = await request(app).post('/api/products').send(sampleProduct);
    expect(res.statusCode).toBe(401);
  });

  it('rejects creation by non-admin', async () => {
    const res = await request(app).post('/api/products').set('Authorization', `Bearer ${userToken}`).send(sampleProduct);
    expect(res.statusCode).toBe(403);
  });

  it('rejects product missing required fields', async () => {
    const res = await request(app).post('/api/products').set('Authorization', `Bearer ${adminToken}`).send({ category: 'Fruits' });
    expect(res.statusCode).toBe(400);
  });
});

describe('PUT /api/products/:id', () => {
  let productId;

  beforeEach(async () => {
    const res = await request(app).post('/api/products').set('Authorization', `Bearer ${adminToken}`).send(sampleProduct);
    productId = res.body.data._id;
  });

  it('admin can update a product', async () => {
    const res = await request(app).put(`/api/products/${productId}`).set('Authorization', `Bearer ${adminToken}`).send({ price: 75 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.price).toBe(75);
  });

  it('rejects update by non-admin', async () => {
    const res = await request(app).put(`/api/products/${productId}`).set('Authorization', `Bearer ${userToken}`).send({ price: 75 });
    expect(res.statusCode).toBe(403);
  });

  it('returns 404 for non-existent product', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`/api/products/${fakeId}`).set('Authorization', `Bearer ${adminToken}`).send({ price: 75 });
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/products/:id', () => {
  let productId;

  beforeEach(async () => {
    const res = await request(app).post('/api/products').set('Authorization', `Bearer ${adminToken}`).send(sampleProduct);
    productId = res.body.data._id;
  });

  it('admin can delete a product', async () => {
    const res = await request(app).delete(`/api/products/${productId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('rejects delete by non-admin', async () => {
    const res = await request(app).delete(`/api/products/${productId}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('returns 404 for non-existent product', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/products/${fakeId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });
});

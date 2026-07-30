const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('./app');

let mongoServer, adminToken, userToken, otherUserToken;

const sampleItem = { product: new mongoose.Types.ObjectId(), name: 'Apple', quantity: 2, price: 50 };
const orderPayload = { items: [sampleItem], totalAmount: 100, street: '123 Main St', city: 'Mumbai', pincode: '400001', paymentMethod: 'cod' };

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  process.env.JWT_SECRET = 'test_secret';

  await request(app).post('/api/auth/register').send({ name: 'Admin', email: 'admin@test.com', password: 'Admin123' });
  await request(app).post('/api/auth/register').send({ name: 'User', email: 'user@test.com', password: 'User1234' });
  await request(app).post('/api/auth/register').send({ name: 'Other', email: 'other@test.com', password: 'Other1234' });

  const User = require('../models/User');
  await User.findOneAndUpdate({ email: 'admin@test.com' }, { role: 'admin' });

  const [adminRes, userRes, otherRes] = await Promise.all([
    request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'Admin123' }),
    request(app).post('/api/auth/login').send({ email: 'user@test.com', password: 'User1234' }),
    request(app).post('/api/auth/login').send({ email: 'other@test.com', password: 'Other1234' }),
  ]);
  adminToken     = adminRes.body.data.token;
  userToken      = userRes.body.data.token;
  otherUserToken = otherRes.body.data.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await mongoose.connection.db.collection('orders').deleteMany({});
});

// ── helpers ────────────────────────────────────────────────────────────────────
const placeOrder = (token = userToken, body = orderPayload) =>
  request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send(body);

const setStatus = (id, status) =>
  request(app).put(`/api/orders/${id}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status });

// ── Place Order ────────────────────────────────────────────────────────────────
describe('POST /api/orders', () => {
  it('customer can place an order', async () => {
    const res = await placeOrder();
    expect(res.statusCode).toBe(201);
    expect(res.body.data.status).toBe('placed');
    expect(res.body.data.totalAmount).toBe(100);
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app).post('/api/orders').send(orderPayload);
    expect(res.statusCode).toBe(401);
  });

  it('rejects empty items array', async () => {
    const res = await placeOrder(userToken, { ...orderPayload, items: [] });
    expect(res.statusCode).toBe(400);
  });

  it('rejects missing totalAmount', async () => {
    const { totalAmount, ...body } = orderPayload;
    const res = await placeOrder(userToken, body);
    expect(res.statusCode).toBe(400);
  });

  it('prepaid order gets coupon and paid status', async () => {
    const res = await placeOrder(userToken, { ...orderPayload, paymentMethod: 'prepaid' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.paymentStatus).toBe('paid');
    expect(res.body.data.couponCode).toBeTruthy();
  });

  it('COD order has pending payment status', async () => {
    const res = await placeOrder();
    expect(res.body.data.paymentStatus).toBe('pending');
    expect(res.body.data.couponCode).toBeNull();
  });
});

// ── View Orders ────────────────────────────────────────────────────────────────
describe('GET /api/orders/my', () => {
  it('user sees only their own orders', async () => {
    await placeOrder(userToken);
    await placeOrder(otherUserToken);
    const res = await request(app).get('/api/orders/my').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app).get('/api/orders/my');
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/orders/all', () => {
  it('admin can view all orders', async () => {
    await placeOrder(userToken);
    await placeOrder(otherUserToken);
    const res = await request(app).get('/api/orders/all').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('non-admin gets 403', async () => {
    const res = await request(app).get('/api/orders/all').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });
});

// ── Update Status ──────────────────────────────────────────────────────────────
describe('PUT /api/orders/:id/status', () => {
  it('admin can update order status', async () => {
    const { body: { data: order } } = await placeOrder();
    const res = await setStatus(order._id, 'confirmed');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('confirmed');
  });

  it('non-admin gets 403', async () => {
    const { body: { data: order } } = await placeOrder();
    const res = await request(app).put(`/api/orders/${order._id}/status`).set('Authorization', `Bearer ${userToken}`).send({ status: 'confirmed' });
    expect(res.statusCode).toBe(403);
  });

  it('returns 404 for non-existent order', async () => {
    const res = await setStatus(new mongoose.Types.ObjectId(), 'confirmed');
    expect(res.statusCode).toBe(404);
  });
});

// ── Cancel Order ───────────────────────────────────────────────────────────────
describe('PUT /api/orders/:id/cancel', () => {
  it('customer can cancel a placed order', async () => {
    const { body: { data: order } } = await placeOrder();
    const res = await request(app).put(`/api/orders/${order._id}/cancel`).set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('cancelled');
  });

  it('cannot cancel after delivery', async () => {
    const { body: { data: order } } = await placeOrder();
    await setStatus(order._id, 'delivered');
    const res = await request(app).put(`/api/orders/${order._id}/cancel`).set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(400);
  });

  it('cannot cancel another user\'s order', async () => {
    const { body: { data: order } } = await placeOrder(userToken);
    const res = await request(app).put(`/api/orders/${order._id}/cancel`).set('Authorization', `Bearer ${otherUserToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('returns 404 for non-existent order', async () => {
    const res = await request(app).put(`/api/orders/${new mongoose.Types.ObjectId()}/cancel`).set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(404);
  });
});

// ── Return Order ───────────────────────────────────────────────────────────────
describe('PUT /api/orders/:id/return', () => {
  it('customer can request return on delivered order', async () => {
    const { body: { data: order } } = await placeOrder();
    await setStatus(order._id, 'delivered');
    const res = await request(app).put(`/api/orders/${order._id}/return`).set('Authorization', `Bearer ${userToken}`).send({ reason: 'Damaged' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('return_requested');
  });

  it('cannot return a non-delivered order', async () => {
    const { body: { data: order } } = await placeOrder();
    const res = await request(app).put(`/api/orders/${order._id}/return`).set('Authorization', `Bearer ${userToken}`).send({ reason: 'Changed mind' });
    expect(res.statusCode).toBe(400);
  });
});

// ── Validation ─────────────────────────────────────────────────────────────────
describe('Invalid order ID', () => {
  it('returns 500 for malformed order ID on status update', async () => {
    const res = await setStatus('not-a-valid-id', 'confirmed');
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('returns 500 for malformed order ID on cancel', async () => {
    const res = await request(app).put('/api/orders/bad-id/cancel').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

const Order = require('../models/Order');
const User = require('../models/User');

const generateCoupon = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'VM';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

exports.placeOrder = async (req, res) => {
  try {
    const { items, totalAmount, street, city, pincode, paymentMethod } = req.body;
    const estimatedDelivery = new Date(Date.now() + 4 * 60 * 60 * 1000);
    const isPrepaid = paymentMethod === 'prepaid';
    const couponCode = isPrepaid ? generateCoupon() : null;
    const couponDiscount = isPrepaid ? Math.round(totalAmount * 0.05) : 0; // 5% discount coupon
    const profitMargin = 20; // 20% profit margin
    const order = await Order.create({
      userId: req.user.id, items, totalAmount, street, city, pincode,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: isPrepaid ? 'paid' : 'pending',
      estimatedDelivery, couponCode, couponDiscount, profitMargin
    });
    // Socket.io removed for serverless compatibility
    res.status(201).json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.generateCouponForOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentMethod !== 'prepaid') return res.status(400).json({ message: 'Coupons only for prepaid orders' });
    const couponCode = generateCoupon();
    const couponDiscount = Math.round(order.totalAmount * 0.05);
    await order.update({ couponCode, couponDiscount });
    res.json({ couponCode, couponDiscount });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!['placed', 'confirmed'].includes(order.status))
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    await order.update({ status: 'cancelled' });
    // Socket.io removed for serverless compatibility
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.returnOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'delivered')
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    await order.update({ status: 'return_requested' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ where: { userId: req.user.id } });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await order.update({ status: req.body.status });
    // Socket.io removed for serverless compatibility
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ include: [{ model: User, attributes: ['name', 'email'] }] });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

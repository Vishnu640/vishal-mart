const Order = require('../models/Order');

const generateCoupon = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'VM';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

exports.placeOrder = async (req, res) => {
  try {
    const { items, totalAmount, street, city, pincode, paymentMethod } = req.body;
    const isPrepaid = paymentMethod === 'prepaid';
    const order = await Order.create({
      userId: req.user.id, items, totalAmount, street, city, pincode,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: isPrepaid ? 'paid' : 'pending',
      estimatedDelivery: new Date(Date.now() + 4 * 60 * 60 * 1000),
      couponCode: isPrepaid ? generateCoupon() : null,
      couponDiscount: isPrepaid ? Math.round(totalAmount * 0.05) : 0,
      profitMargin: 20
    });
    res.status(201).json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
    const mapped = orders.map(o => ({ ...o.toObject(), User: o.userId, id: o._id }));
    res.json(mapped);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!['placed', 'confirmed'].includes(order.status))
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    order.status = 'cancelled';
    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.returnOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'delivered')
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    order.status = 'return_requested';
    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.generateCouponForOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentMethod !== 'prepaid') return res.status(400).json({ message: 'Coupons only for prepaid orders' });
    const couponCode = generateCoupon();
    const couponDiscount = Math.round(order.totalAmount * 0.05);
    order.couponCode = couponCode;
    order.couponDiscount = couponDiscount;
    await order.save();
    res.json({ couponCode, couponDiscount });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

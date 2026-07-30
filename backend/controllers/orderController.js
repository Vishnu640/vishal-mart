const Order = require('../models/Order');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOutForDeliveryEmail,
  sendDeliveredEmail,
} = require('../utils/emailService');

const generateCoupon = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'VM';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

exports.placeOrder = async (req, res) => {
  try {
    const { items, totalAmount, street, city, pincode, paymentMethod } = req.body;
    if (!items || items.length === 0) return sendError(res, 'Order must contain at least one item', 400);
    if (totalAmount == null) return sendError(res, 'totalAmount is required', 400);
    const isPrepaid = paymentMethod === 'prepaid';
    const order = await Order.create({
      userId: req.user.id, items, totalAmount, street, city, pincode,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: isPrepaid ? 'paid' : 'pending',
      estimatedDelivery: new Date(Date.now() + 4 * 60 * 60 * 1000),
      couponCode: isPrepaid ? generateCoupon() : null,
      couponDiscount: isPrepaid ? Math.round(totalAmount * 0.05) : 0,
      profitMargin: 20,
    });
    const user = await User.findById(req.user.id).select('name email');
    if (user) sendOrderConfirmationEmail(user, order);
    sendSuccess(res, order, 201);
  } catch (err) { sendError(res, err.message); }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    sendSuccess(res, orders);
  } catch (err) { sendError(res, err.message); }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
    const mapped = orders.map(o => ({ ...o.toObject(), User: o.userId, id: o._id }));
    sendSuccess(res, mapped);
  } catch (err) { sendError(res, err.message); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate('userId', 'name email');
    if (!order) return sendError(res, 'Order not found', 404);
    const user = order.userId;
    if (user) {
      if (req.body.status === 'shipped')          sendOrderShippedEmail(user, order);
      if (req.body.status === 'out_for_delivery') sendOutForDeliveryEmail(user, order);
      if (req.body.status === 'delivered')        sendDeliveredEmail(user, order);
    }
    sendSuccess(res, order);
  } catch (err) { sendError(res, err.message); }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return sendError(res, 'Order not found', 404);
    if (!['placed', 'confirmed'].includes(order.status))
      return sendError(res, 'Order cannot be cancelled at this stage', 400);
    order.status = 'cancelled';
    await order.save();
    sendSuccess(res, order);
  } catch (err) { sendError(res, err.message); }
};

exports.returnOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return sendError(res, 'Order not found', 404);
    if (order.status !== 'delivered')
      return sendError(res, 'Only delivered orders can be returned', 400);
    order.status = 'return_requested';
    await order.save();
    sendSuccess(res, order);
  } catch (err) { sendError(res, err.message); }
};

exports.generateCouponForOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return sendError(res, 'Order not found', 404);
    if (order.paymentMethod !== 'prepaid')
      return sendError(res, 'Coupons only for prepaid orders', 400);
    const couponCode = generateCoupon();
    const couponDiscount = Math.round(order.totalAmount * 0.05);
    order.couponCode = couponCode;
    order.couponDiscount = couponDiscount;
    await order.save();
    sendSuccess(res, { couponCode, couponDiscount });
  } catch (err) { sendError(res, err.message); }
};

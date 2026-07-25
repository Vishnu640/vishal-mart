const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: Array, required: true },
  totalAmount: { type: Number, required: true },
  street: String,
  city: String,
  pincode: String,
  status: { type: String, enum: ['placed','confirmed','packed','out_for_delivery','delivered','cancelled','return_requested','returned'], default: 'placed' },
  paymentMethod: { type: String, enum: ['cod','prepaid'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending','paid'], default: 'pending' },
  estimatedDelivery: Date,
  deliveryAgentId: mongoose.Schema.Types.ObjectId,
  couponCode: { type: String, default: null },
  couponDiscount: { type: Number, default: 0 },
  profitMargin: { type: Number, default: 20 }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);

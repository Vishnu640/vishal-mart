const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  street: String,
  city: String,
  pincode: String,
  role: { type: String, enum: ['customer', 'admin', 'delivery'], default: 'customer' },
  loginAttempts: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  lockUntil: Date,
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
  avatar: String,
  notificationsEnabled: { type: Boolean, default: true },
  twoFactorEnabled: { type: Boolean, default: false }
}, { timestamps: true });

UserSchema.methods.update = async function(data) {
  Object.assign(this, data);
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendSuccess, sendError } = require('../utils/response');
const { sendWelcomeEmail } = require('../utils/emailService');

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

const otpStore = {};

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length !== 10)
      return sendError(res, 'Valid 10-digit phone number required', 400);

    const existing = otpStore[phone];
    if (existing && existing.expiry > Date.now())
      return sendSuccess(res, { expiresIn: Math.ceil((existing.expiry - Date.now()) / 1000) });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = { otp, expiry: Date.now() + 60 * 1000 };
    // In production: send OTP via SMS provider (e.g. Twilio, MSG91)
    console.log(`[OTP] Phone: ${phone} | OTP: ${otp}`);
    sendSuccess(res, { message: 'OTP sent successfully', expiresIn: 60 });
  } catch (err) { sendError(res, err.message); }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const stored = otpStore[phone];
    if (!stored) return sendError(res, 'OTP not sent or expired', 400);
    if (Date.now() > stored.expiry) {
      delete otpStore[phone];
      return sendError(res, 'OTP expired. Please resend.', 400);
    }
    if (stored.otp !== otp) return sendError(res, 'Invalid OTP', 400);
    delete otpStore[phone];
    sendSuccess(res, { message: 'OTP verified', verified: true });
  } catch (err) { sendError(res, err.message); }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, street, city, pincode } = req.body;
    if (!name || !email || !password)
      return sendError(res, 'Name, email and password are required', 400);
    if (password.length < 8)
      return sendError(res, 'Password must be at least 8 characters', 400);
    if (!/(?=.*[A-Z])(?=.*[0-9])/.test(password))
      return sendError(res, 'Password must contain at least one uppercase letter and one number', 400);

    const existing = await User.findOne({ email });
    if (existing) return sendError(res, 'Email already registered', 400);

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, phone, street, city, pincode, role: 'user', isVerified: true });
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    sendWelcomeEmail({ name, email });
    sendSuccess(res, { token, user: { id: user._id, name, email, role: user.role } }, 201);
  } catch (err) { sendError(res, err.message, 400); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return sendError(res, 'Email and password are required', 400);

    const user = await User.findOne({ email });
    if (!user) return sendError(res, 'Invalid email or password', 401);

    if (user.isLocked) {
      if (user.lockUntil && new Date() < new Date(user.lockUntil)) {
        const mins = Math.ceil((new Date(user.lockUntil) - new Date()) / 60000);
        return sendError(res, `Account locked. Try again in ${mins} minute(s).`, 423, { locked: true });
      }
      user.isLocked = false; user.loginAttempts = 0; user.lockUntil = null;
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const attempts = (user.loginAttempts || 0) + 1;
      if (attempts >= MAX_ATTEMPTS) {
        user.loginAttempts = attempts; user.isLocked = true; user.lockUntil = new Date(Date.now() + LOCK_TIME);
        await user.save();
        return sendError(res, 'Too many failed attempts. Account locked for 15 minutes.', 423, { locked: true });
      }
      user.loginAttempts = attempts;
      await user.save();
      return sendError(res, `Invalid password. ${MAX_ATTEMPTS - attempts} attempt(s) remaining.`, 401, { attemptsLeft: MAX_ATTEMPTS - attempts });
    }

    user.loginAttempts = 0; user.isLocked = false; user.lockUntil = null;
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    sendSuccess(res, { token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (err) { sendError(res, err.message); }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (newPassword.length < 8)
      return sendError(res, 'New password must be at least 8 characters', 400);
    if (!/(?=.*[A-Z])(?=.*[0-9])/.test(newPassword))
      return sendError(res, 'Password must contain uppercase and number', 400);

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return sendError(res, 'Current password is incorrect', 401);

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    sendSuccess(res, { message: 'Password changed successfully' });
  } catch (err) { sendError(res, err.message); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, street, city, pincode, notificationsEnabled } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, street, city, pincode, notificationsEnabled },
      { new: true }
    );
    sendSuccess(res, { message: 'Profile updated', user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, city: user.city } });
  } catch (err) { sendError(res, err.message); }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp');
    sendSuccess(res, user);
  } catch (err) { sendError(res, err.message); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password -otp').sort({ createdAt: -1 });
    sendSuccess(res, users);
  } catch (err) { sendError(res, err.message); }
};

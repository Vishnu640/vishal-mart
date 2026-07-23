const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, street, city, pincode } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (!/(?=.*[A-Z])(?=.*[0-9])/.test(password)) return res.status(400).json({ message: 'Password must contain at least one uppercase letter and one number' });
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const user = await User.create({ name, email, password: hashed, phone, street, city, pincode, otp, otpExpiry, isVerified: true });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name, email, role: user.role }, otp });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    // Check account lock
    if (user.isLocked) {
      if (user.lockUntil && new Date() < new Date(user.lockUntil)) {
        const mins = Math.ceil((new Date(user.lockUntil) - new Date()) / 60000);
        return res.status(423).json({ message: `Account locked. Try again in ${mins} minute(s).`, locked: true });
      }
      await user.update({ isLocked: false, loginAttempts: 0, lockUntil: null });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const attempts = (user.loginAttempts || 0) + 1;
      if (attempts >= MAX_ATTEMPTS) {
        await user.update({ loginAttempts: attempts, isLocked: true, lockUntil: new Date(Date.now() + LOCK_TIME) });
        return res.status(423).json({ message: `Too many failed attempts. Account locked for 15 minutes.`, locked: true });
      }
      await user.update({ loginAttempts: attempts });
      return res.status(401).json({ message: `Invalid password. ${MAX_ATTEMPTS - attempts} attempt(s) remaining.`, attemptsLeft: MAX_ATTEMPTS - attempts });
    }

    await user.update({ loginAttempts: 0, isLocked: false, lockUntil: null });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' });
    if (!/(?=.*[A-Z])(?=.*[0-9])/.test(newPassword)) return res.status(400).json({ message: 'Password must contain uppercase and number' });
    const user = await User.findByPk(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });
    await user.update({ password: await bcrypt.hash(newPassword, 12) });
    res.json({ message: 'Password changed successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, street, city, pincode, notificationsEnabled } = req.body;
    const user = await User.findByPk(req.user.id);
    await user.update({ name, phone, street, city, pincode, notificationsEnabled });
    res.json({ message: 'Profile updated', user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, city: user.city } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password', 'otp'] } });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

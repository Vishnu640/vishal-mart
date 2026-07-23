const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  phone: DataTypes.STRING,
  street: DataTypes.STRING,
  city: DataTypes.STRING,
  pincode: DataTypes.STRING,
  role: { type: DataTypes.ENUM('customer', 'admin', 'delivery'), defaultValue: 'customer' },
  loginAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  isLocked: { type: DataTypes.BOOLEAN, defaultValue: false },
  lockUntil: DataTypes.DATE,
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  otp: DataTypes.STRING,
  otpExpiry: DataTypes.DATE,
  avatar: DataTypes.STRING,
  notificationsEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  twoFactorEnabled: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true });

module.exports = User;

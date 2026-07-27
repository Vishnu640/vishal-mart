const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  items: { type: DataTypes.JSON, allowNull: false },
  totalAmount: { type: DataTypes.FLOAT, allowNull: false },
  street: DataTypes.STRING,
  city: DataTypes.STRING,
  pincode: DataTypes.STRING,
  status: { type: DataTypes.ENUM('placed','confirmed','packed','out_for_delivery','delivered','cancelled','return_requested','returned'), defaultValue: 'placed' },
  paymentMethod: { type: DataTypes.ENUM('cod','prepaid'), defaultValue: 'cod' },
  paymentStatus: { type: DataTypes.ENUM('pending','paid'), defaultValue: 'pending' },
  estimatedDelivery: DataTypes.DATE,
  couponCode: { type: DataTypes.STRING, defaultValue: null },
  couponDiscount: { type: DataTypes.INTEGER, defaultValue: 0 },
  profitMargin: { type: DataTypes.INTEGER, defaultValue: 20 }
}, { timestamps: true });

module.exports = Order;

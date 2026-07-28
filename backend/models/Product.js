const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  image: String,
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

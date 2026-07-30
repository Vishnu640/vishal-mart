const Product = require('../models/Product');
const { sendSuccess, sendError } = require('../utils/response');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    sendSuccess(res, products);
  } catch (err) { sendError(res, err.message); }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, category, price, stock, image, description } = req.body;
    if (!name || !price) return sendError(res, 'Name and price are required', 400);
    const product = await Product.create({ name, category, price, stock, image, description });
    sendSuccess(res, product, 201);
  } catch (err) { sendError(res, err.message, 400); }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, category, price, stock, image, description } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, price, stock, image, description },
      { new: true, runValidators: true }
    );
    if (!product) return sendError(res, 'Product not found', 404);
    sendSuccess(res, product);
  } catch (err) { sendError(res, err.message); }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return sendError(res, 'Product not found', 404);
    sendSuccess(res, { message: 'Product deleted' });
  } catch (err) { sendError(res, err.message); }
};

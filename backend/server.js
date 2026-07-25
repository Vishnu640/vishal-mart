const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: 'DB connection failed: ' + err.message });
  }
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/seed', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const User = require('./models/User');
    const Product = require('./models/Product');
    const existing = await User.findOne({ email: 'admin@vishalmart.com' });
    if (!existing) {
      const hashed = await bcrypt.hash('Admin@123', 10);
      await User.create({ name: 'Admin', email: 'admin@vishalmart.com', password: hashed, role: 'admin', isVerified: true });
    }

    res.json({ message: 'Seeded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

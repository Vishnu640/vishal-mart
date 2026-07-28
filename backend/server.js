const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db');

dotenv.config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.use(async (req, res, next) => { await connectDB(); next(); });

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

app.get('/', (req, res) => res.json({ message: 'Vishal Mart API is running' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/seed', async (req, res) => {
  try {
    const User = require('./models/User');
    const Product = require('./models/Product');
    const bcrypt = require('bcryptjs');

    const existing = await User.findOne({ email: 'admin@vishalmart.com' });
    if (!existing) {
      const hashed = await bcrypt.hash('Admin@123', 10);
      await User.create({ name: 'Admin', email: 'admin@vishalmart.com', password: hashed, role: 'admin' });
    }

    const count = await Product.countDocuments();
    if (count === 0) {
      const { products } = require('./seeder');
      await Product.insertMany(products);
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

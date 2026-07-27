const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Order = require('./models/Order');

dotenv.config();

// Associations
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

connectDB();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

app.get('/', (req, res) => res.json({ message: 'Vishal Mart API is running' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;

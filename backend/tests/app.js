const express = require('express');
const cors = require('cors');
const { errorHandler } = require('../middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',     require('../routes/authRoutes'));
app.use('/api/products', require('../routes/productRoutes'));
app.use('/api/orders',   require('../routes/orderRoutes'));

app.use((req, res) => res.status(404).json({ success: false, message: 'Not found' }));
app.use(errorHandler);

module.exports = app;

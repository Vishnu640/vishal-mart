const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const swaggerSpec = require('./swagger');

dotenv.config();
connectDB();

const app = express();

// Request logging — skip in test environment
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('[:date[clf]] :method :url :status :res[content-length] - :response-time ms'));
}

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Stricter limit on auth routes — 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());
app.use('/api/', limiter);

// API Routes
app.use('/api/auth',     authLimiter, require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));

// Swagger UI — available at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Vishal Mart API Docs',
  customCss: '.swagger-ui .topbar { background: linear-gradient(135deg, #0d47a1, #1a73e8); }',
}));

// Health check
app.get('/',           (req, res) => res.json({ success: true, data: { message: 'Vishal Mart API Running', docs: '/api-docs' } }));
app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global error handler — must be last
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}\nAPI Docs: http://localhost:${PORT}/api-docs`));

module.exports = app;

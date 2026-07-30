# 🛒 Vishal Mart

[![Backend Tests](https://github.com/Vishnu640/vishal-mart/actions/workflows/test.yml/badge.svg)](https://github.com/Vishnu640/vishal-mart/actions/workflows/test.yml)
[![Node](https://img.shields.io/badge/node-20.x-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-18-blue)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/mongodb-mongoose-green)](https://mongoosejs.com)
[![Docker](https://img.shields.io/badge/docker-compose-blue)](https://www.docker.com)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

A production-ready full-stack e-commerce application built with the MERN stack. Customers can browse products, place orders, track delivery, and download PDF invoices. Admins get a full dashboard with order management, analytics charts, and product CRUD.

**🌐 Live Demo:** [https://vishal-mart.vercel.app](https://vishal-mart.vercel.app)  
**📘 API Docs:** [https://backend-eight-chi-55.vercel.app/api-docs](https://backend-eight-chi-55.vercel.app/api-docs)  
**📦 Repository:** [https://github.com/Vishnu640/vishal-mart](https://github.com/Vishnu640/vishal-mart)

---

## 📸 Screenshots

| Home | Cart | Orders |
|---|---|---|
| ![Home](screenshots/home.png) | ![Cart](screenshots/cart.png) | ![Orders](screenshots/orders.png) |

| Admin Dashboard | Analytics | Invoice |
|---|---|---|
| ![Admin](screenshots/admin-dashboard.png) | ![Analytics](screenshots/analytics.png) | ![Invoice](screenshots/invoice.png) |

> Add screenshots to the `screenshots/` folder to display them here.

---

## ✨ Features

### Customer
- Register / Login with JWT authentication
- Browse 80+ products across 14 categories
- Add to cart, adjust quantities, apply coupons
- Place orders — Cash on Delivery or Prepaid (online)
- Real-time order tracking with a 5-step status stepper
- Cancel orders before shipment; request returns after delivery
- Download professional PDF invoices (jsPDF + autoTable)
- Email notifications for registration, order placed, shipped, delivered

### Admin
- Full product CRUD — create, update, delete
- View and manage all customer orders
- Update order status: confirmed → packed → out for delivery → delivered
- Analytics dashboard (Recharts)
  - Revenue over time (line chart)
  - Orders by status (pie chart)
  - Top-selling products (bar chart)
  - Category breakdown
- Generate 5% discount coupons for prepaid orders

### Technical
- Consistent JSON response format (`{ success, data, message }`)
- Swagger / OpenAPI interactive docs at `/api-docs`
- Global error handling middleware
- Account lockout after 5 failed login attempts
- CORS configured for multi-origin deployment
- Dockerized — frontend + backend + MongoDB via Compose
- 42 automated tests (Jest + Supertest + in-memory MongoDB)

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios, Recharts, jsPDF |
| Backend | Node.js 20, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| API Docs | Swagger UI (swagger-jsdoc) |
| Testing | Jest, Supertest, mongodb-memory-server |
| DevOps | Docker, Docker Compose |
| Deployment | Vercel (frontend), Railway (backend) |

---

## 📁 Folder Structure

```
vishal-mart/
├── backend/
│   ├── config/             # MongoDB connection
│   ├── controllers/        # authController, productController, orderController
│   ├── middleware/         # authMiddleware (JWT + adminOnly), errorHandler
│   ├── models/             # User, Product, Order schemas
│   ├── routes/             # authRoutes, productRoutes, orderRoutes
│   ├── tests/
│   │   ├── app.js          # Express app without server.listen (for tests)
│   │   ├── auth.test.js    # 8 tests
│   │   ├── products.test.js # 13 tests
│   │   └── orders.test.js  # 21 tests
│   ├── utils/              # emailService, response helpers
│   ├── adminSeeder.js      # Seeds admin user
│   ├── seeder.js           # Seeds 80+ products
│   ├── swagger.js          # OpenAPI spec
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/            # Axios instance with base URL + auth header
│       ├── components/     # Navbar, ProductCard, QRScanner
│       ├── context/        # AuthContext (login, logout, user state)
│       └── pages/          # Home, Cart, Orders, AdminDashboard, Login, Register, ...
├── screenshots/            # Add app screenshots here
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- MongoDB running locally, or a MongoDB Atlas connection string
- npm

### 1. Clone

```bash
git clone https://github.com/Vishnu640/vishal-mart.git
cd vishal-mart
```

### 2. Backend

```bash
cd backend
cp .env.example .env    # then fill in your values
npm install
npm run dev             # http://localhost:5001
```

`.env` variables:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/vishalmart
JWT_SECRET=replace_with_a_long_random_string
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:3000
```

### 3. Seed data

```bash
# from backend/
node adminSeeder.js   # creates admin user
node seeder.js        # seeds 80+ products
```

### 4. Frontend

```bash
cd ../frontend
cp .env.example .env
npm install
npm start             # http://localhost:3000
```

`.env` variable:

```env
REACT_APP_API_URL=http://localhost:5001/api
```

### 5. Docker (runs everything together)

```bash
# from project root
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5001 |
| Swagger Docs | http://localhost:5001/api-docs |

---

## 🧪 Tests

```bash
cd backend
npm test
```

```
Test Suites: 3 passed, 3 total
Tests:       42 passed, 42 total
Time:        ~6s
```

| Suite | Tests | What's covered |
|---|---|---|
| `auth.test.js` | 8 | Register, login, duplicate email, weak password, account lockout |
| `products.test.js` | 13 | Public GET, admin CRUD, 401/403/404 responses |
| `orders.test.js` | 21 | Place order, view (user isolation), admin view all, status update, cancel, return, validation |

Tests run against an in-memory MongoDB instance — no real database or `.env` needed.

---

## 📡 API Reference

Full interactive docs at `/api-docs`. Quick reference:

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | — | List all products |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | Customer | Place order |
| GET | `/api/orders/my` | Customer | My orders |
| GET | `/api/orders/all` | Admin | All orders |
| PUT | `/api/orders/:id/status` | Admin | Update status |
| PUT | `/api/orders/:id/cancel` | Customer | Cancel order |
| PUT | `/api/orders/:id/return` | Customer | Request return |
| POST | `/api/orders/:id/coupon` | Admin | Generate coupon |

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@vishalmart.com | Admin@123 |
| Customer | demo@vishalmart.com | Demo@1234 |

Seeded by `adminSeeder.js`. The customer demo account must be registered manually or added to the seeder.

---

## 🌐 Deployment

### Backend — Railway

1. Connect your GitHub repo to Railway
2. Set all `.env` variables in the Railway dashboard
3. Railway auto-deploys on every push to `main`
4. `railway.toml` is already configured

### Frontend — Vercel

1. Import the `frontend/` folder into Vercel
2. Set `REACT_APP_API_URL` to your Railway backend URL
3. `vercel.json` handles SPA routing rewrites

---

## 🔮 Planned

- [ ] Razorpay / Stripe real payment integration
- [ ] Product search and filters (category, price, rating)
- [ ] Wishlist
- [ ] Ratings and reviews
- [ ] Admin coupon management (create, expiry, usage limits)
- [ ] GitHub Actions CI — run tests on every push
- [ ] Frontend test suite

---

## 📄 License

MIT © [Vishnu640](https://github.com/Vishnu640)

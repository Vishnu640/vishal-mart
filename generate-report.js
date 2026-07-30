const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ margin: 50, size: 'A4' });
const outputPath = path.join(__dirname, 'Vishal_Mart_Project_Report.pdf');
doc.pipe(fs.createWriteStream(outputPath));

const BLUE = '#1a73e8';
const DARK = '#1a1a2e';
const GRAY = '#555555';
const LIGHT_GRAY = '#f5f5f5';
const WHITE = '#ffffff';
const GREEN = '#28a745';
const ORANGE = '#fd7e14';

function sectionTitle(text) {
  doc.moveDown(0.5)
    .rect(50, doc.y, 495, 28).fill(BLUE)
    .fillColor(WHITE).fontSize(13).font('Helvetica-Bold')
    .text(text, 60, doc.y - 22)
    .fillColor(DARK).font('Helvetica').fontSize(11)
    .moveDown(0.8);
}

function subTitle(text) {
  doc.fillColor(BLUE).fontSize(11).font('Helvetica-Bold').text(text).fillColor(DARK).font('Helvetica').fontSize(10).moveDown(0.3);
}

function bullet(text, indent = 70) {
  doc.fontSize(10).fillColor(DARK).font('Helvetica')
    .text(`• ${text}`, indent, doc.y, { width: 460 - (indent - 50) })
    .moveDown(0.2);
}

function keyValue(key, value) {
  doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK).text(key + ': ', { continued: true })
    .font('Helvetica').fillColor(GRAY).text(value).moveDown(0.2);
}

function tableRow(col1, col2, col3, isHeader = false) {
  const y = doc.y;
  const bg = isHeader ? BLUE : (doc.y % 20 < 10 ? LIGHT_GRAY : WHITE);
  doc.rect(50, y, 495, 18).fill(bg);
  const color = isHeader ? WHITE : DARK;
  const font = isHeader ? 'Helvetica-Bold' : 'Helvetica';
  doc.fillColor(color).font(font).fontSize(9)
    .text(col1, 55, y + 4, { width: 160 })
    .text(col2, 220, y + 4, { width: 160 })
    .text(col3, 385, y + 4, { width: 155 });
  doc.y = y + 20;
}

// ─── COVER PAGE ───────────────────────────────────────────────────────────────
doc.rect(0, 0, 612, 792).fill(DARK);
doc.rect(0, 0, 612, 8).fill(BLUE);
doc.rect(0, 784, 612, 8).fill(BLUE);

doc.moveDown(4);
doc.fillColor(BLUE).fontSize(36).font('Helvetica-Bold').text('VISHAL MART', { align: 'center' });
doc.fillColor(WHITE).fontSize(16).font('Helvetica').text('Full-Stack E-Commerce Web Application', { align: 'center' });
doc.moveDown(0.5);
doc.fillColor(GRAY).fontSize(12).text('Project Technical Report', { align: 'center' });

doc.moveDown(3);
doc.rect(180, doc.y, 252, 1).fill(BLUE);
doc.moveDown(1.5);

const infoItems = [
  ['Project Name', 'Vishal Mart'],
  ['Type', 'Full-Stack Web Application'],
  ['Frontend', 'React.js'],
  ['Backend', 'Node.js + Express.js'],
  ['Database', 'MongoDB Atlas'],
  ['Deployment', 'Vercel (Frontend + Backend)'],
  ['Version Control', 'GitHub'],
];

infoItems.forEach(([k, v]) => {
  doc.fillColor(GRAY).fontSize(11).font('Helvetica-Bold').text(`${k}:  `, 180, doc.y, { continued: true, width: 252 })
    .fillColor(WHITE).font('Helvetica').text(v).moveDown(0.4);
});

doc.moveDown(2);
doc.fillColor(GRAY).fontSize(10).text('Generated: ' + new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), { align: 'center' });

// ─── PAGE 2: TABLE OF CONTENTS ────────────────────────────────────────────────
doc.addPage();
doc.rect(0, 0, 612, 792).fill(WHITE);

doc.fillColor(BLUE).fontSize(22).font('Helvetica-Bold').text('Table of Contents', 50, 60);
doc.rect(50, 90, 495, 2).fill(BLUE);
doc.moveDown(2);

const toc = [
  ['1.', 'Project Overview', '3'],
  ['2.', 'Technology Stack', '3'],
  ['3.', 'System Architecture', '4'],
  ['4.', 'Features & Modules', '4'],
  ['5.', 'Database Design', '5'],
  ['6.', 'API Endpoints', '6'],
  ['7.', 'Deployment & Infrastructure', '7'],
  ['8.', 'Security Implementation', '8'],
  ['9.', 'Project Structure', '8'],
  ['10.', 'Live URLs & Credentials', '9'],
  ['11.', 'Challenges & Solutions', '9'],
  ['12.', 'Conclusion', '10'],
];

toc.forEach(([num, title, page]) => {
  const y = doc.y;
  doc.fillColor(BLUE).fontSize(11).font('Helvetica-Bold').text(num, 60, y, { width: 30 });
  doc.fillColor(DARK).font('Helvetica').text(title, 95, y, { width: 380 });
  doc.fillColor(GRAY).text(page, 490, y, { width: 40, align: 'right' });
  doc.rect(95, y + 14, 380, 0.5).fill('#dddddd');
  doc.y = y + 22;
});

// ─── PAGE 3: OVERVIEW + TECH STACK ───────────────────────────────────────────
doc.addPage();
doc.fillColor(DARK);

sectionTitle('1. Project Overview');
doc.fontSize(10).fillColor(DARK).font('Helvetica')
  .text('Vishal Mart is a modern, full-stack e-commerce web application designed to provide a seamless online shopping experience. The platform supports customer registration, product browsing, cart management, order placement, and an admin dashboard for complete store management.', { width: 495 })
  .moveDown(0.5);

doc.text('The application was built using the MERN-like stack (React + Node.js + MongoDB) and deployed on Vercel with MongoDB Atlas as the cloud database. The project demonstrates real-world deployment practices including serverless architecture, JWT authentication, and RESTful API design.', { width: 495 })
  .moveDown(1);

sectionTitle('2. Technology Stack');

subTitle('Frontend');
const feStack = [
  ['React.js 19', 'UI framework with hooks and context API'],
  ['React Router DOM v7', 'Client-side routing and navigation'],
  ['Axios', 'HTTP client for API communication'],
  ['HTML5 QR Code', 'QR code scanning functionality'],
  ['Socket.io Client', 'Real-time communication'],
  ['CRACO', 'Create React App Configuration Override'],
];
feStack.forEach(([tech, desc]) => bullet(`${tech} — ${desc}`));

doc.moveDown(0.5);
subTitle('Backend');
const beStack = [
  ['Node.js 24.x', 'JavaScript runtime environment'],
  ['Express.js 5', 'Web application framework'],
  ['Mongoose', 'MongoDB ODM for schema modeling'],
  ['JWT (jsonwebtoken)', 'Stateless authentication tokens'],
  ['bcryptjs', 'Password hashing and verification'],
  ['CORS', 'Cross-Origin Resource Sharing middleware'],
  ['dotenv', 'Environment variable management'],
];
beStack.forEach(([tech, desc]) => bullet(`${tech} — ${desc}`));

doc.moveDown(0.5);
subTitle('Database & Infrastructure');
const infraStack = [
  ['MongoDB Atlas', 'Cloud-hosted NoSQL database (M0 free tier)'],
  ['Vercel', 'Serverless deployment platform (frontend + backend)'],
  ['GitHub', 'Version control and source code repository'],
];
infraStack.forEach(([tech, desc]) => bullet(`${tech} — ${desc}`));

// ─── PAGE 4: ARCHITECTURE + FEATURES ─────────────────────────────────────────
doc.addPage();

sectionTitle('3. System Architecture');
doc.fontSize(10).fillColor(DARK).font('Helvetica')
  .text('The application follows a decoupled client-server architecture deployed as two separate Vercel projects:', { width: 495 }).moveDown(0.5);

const archItems = [
  'Frontend (React SPA) → deployed at frontend-black-sigma-94.vercel.app',
  'Backend (Express API) → deployed at backend-eight-chi-55.vercel.app',
  'Database → MongoDB Atlas cluster (cluster0.v4ykp90.mongodb.net)',
  'Frontend communicates with backend via HTTPS REST API calls using Axios',
  'Backend connects to MongoDB Atlas using Mongoose with serverless connection caching',
  'JWT tokens stored in localStorage for stateless session management',
  'All API routes protected with authMiddleware verifying JWT on each request',
];
archItems.forEach(a => bullet(a));

doc.moveDown(0.5);
doc.fontSize(10).fillColor(DARK).font('Helvetica-Bold').text('Request Flow:', { width: 495 });
doc.font('Helvetica').text('User Browser → React Frontend → Axios HTTP → Vercel Serverless Function → Express Router → Controller → Mongoose → MongoDB Atlas', { width: 495 }).moveDown(1);

sectionTitle('4. Features & Modules');

subTitle('Customer Features');
const custFeatures = [
  'User Registration with email, phone, address, and password',
  'Secure Login with JWT token-based authentication',
  'Browse products by category with search and filter',
  'Add to Cart with quantity management',
  'Place orders and view order history with status tracking',
  'QR Code scanning for quick product lookup',
  'Profile management — update name, phone, address',
  'Change password with current password verification',
  'OTP-based password recovery (send/verify OTP)',
  'Feedback submission system',
];
custFeatures.forEach(f => bullet(f));

doc.moveDown(0.5);
subTitle('Admin Features');
const adminFeatures = [
  'Secure admin login with role-based access control',
  'Admin Dashboard with sales overview and statistics',
  'Product management — add, view, and delete products',
  'Order management — view all orders, update order status',
  'User management — view all registered customers',
  'Seed database with initial products via /api/seed endpoint',
];
adminFeatures.forEach(f => bullet(f));

// ─── PAGE 5: DATABASE DESIGN ──────────────────────────────────────────────────
doc.addPage();

sectionTitle('5. Database Design');
doc.fontSize(10).fillColor(DARK).font('Helvetica')
  .text('MongoDB Atlas is used as the database with Mongoose ODM. Three main collections are defined:', { width: 495 }).moveDown(0.8);

subTitle('Users Collection');
doc.moveDown(0.2);
tableRow('Field', 'Type', 'Description', true);
[
  ['_id', 'ObjectId', 'Auto-generated primary key'],
  ['name', 'String (required)', 'Full name of the user'],
  ['email', 'String (unique)', 'Email address for login'],
  ['password', 'String (hashed)', 'bcrypt hashed password'],
  ['phone', 'String', 'Contact phone number'],
  ['address', 'String', 'Delivery address'],
  ['role', 'String (enum)', '"user" or "admin" (default: user)'],
  ['otp', 'String', 'OTP for password recovery'],
  ['otpExpiry', 'Date', 'OTP expiration timestamp'],
  ['createdAt', 'Date', 'Auto-managed by Mongoose'],
].forEach(([f, t, d]) => tableRow(f, t, d));

doc.moveDown(1);
subTitle('Products Collection');
doc.moveDown(0.2);
tableRow('Field', 'Type', 'Description', true);
[
  ['_id', 'ObjectId', 'Auto-generated primary key'],
  ['name', 'String (required)', 'Product name'],
  ['category', 'String (required)', 'Product category'],
  ['price', 'Number (required)', 'Product price in INR'],
  ['stock', 'Number', 'Available stock quantity'],
  ['image', 'String', 'Product image URL'],
  ['description', 'String', 'Product description text'],
].forEach(([f, t, d]) => tableRow(f, t, d));

doc.moveDown(1);
subTitle('Orders Collection');
doc.moveDown(0.2);
tableRow('Field', 'Type', 'Description', true);
[
  ['_id', 'ObjectId', 'Auto-generated primary key'],
  ['userId', 'ObjectId (ref: User)', 'Reference to the ordering user'],
  ['items', 'Array', 'Array of {productId, name, price, qty}'],
  ['total', 'Number', 'Total order amount in INR'],
  ['status', 'String (enum)', 'pending / confirmed / delivered'],
  ['createdAt', 'Date', 'Order placement timestamp'],
].forEach(([f, t, d]) => tableRow(f, t, d));

// ─── PAGE 6: API ENDPOINTS ────────────────────────────────────────────────────
doc.addPage();

sectionTitle('6. API Endpoints');
doc.fontSize(10).fillColor(DARK).font('Helvetica')
  .text('Base URL: https://backend-eight-chi-55.vercel.app/api', { width: 495 }).moveDown(0.8);

subTitle('Authentication Routes  (/api/auth)');
doc.moveDown(0.2);
tableRow('Method + Endpoint', 'Auth Required', 'Description', true);
[
  ['POST /register', 'No', 'Register a new user account'],
  ['POST /login', 'No', 'Login and receive JWT token'],
  ['GET /profile', 'Yes (JWT)', 'Get current user profile'],
  ['PUT /profile', 'Yes (JWT)', 'Update user profile details'],
  ['PUT /change-password', 'Yes (JWT)', 'Change user password'],
  ['GET /users', 'Yes (Admin)', 'Get all registered users'],
  ['POST /send-otp', 'No', 'Send OTP to email for recovery'],
  ['POST /verify-otp', 'No', 'Verify OTP and reset password'],
].forEach(([e, a, d]) => tableRow(e, a, d));

doc.moveDown(1);
subTitle('Product Routes  (/api/products)');
doc.moveDown(0.2);
tableRow('Method + Endpoint', 'Auth Required', 'Description', true);
[
  ['GET /', 'No', 'Get all products'],
  ['POST /', 'Yes (Admin)', 'Add a new product'],
  ['DELETE /:id', 'Yes (Admin)', 'Delete a product by ID'],
].forEach(([e, a, d]) => tableRow(e, a, d));

doc.moveDown(1);
subTitle('Order Routes  (/api/orders)');
doc.moveDown(0.2);
tableRow('Method + Endpoint', 'Auth Required', 'Description', true);
[
  ['POST /', 'Yes (JWT)', 'Place a new order'],
  ['GET /my', 'Yes (JWT)', 'Get orders for current user'],
  ['GET /all', 'Yes (Admin)', 'Get all orders (admin view)'],
  ['PUT /:id/status', 'Yes (Admin)', 'Update order status'],
].forEach(([e, a, d]) => tableRow(e, a, d));

doc.moveDown(1);
subTitle('Utility Routes');
doc.moveDown(0.2);
tableRow('Method + Endpoint', 'Auth Required', 'Description', true);
[
  ['GET /', 'No', 'API health check message'],
  ['GET /api/health', 'No', 'Returns { status: "ok" }'],
  ['GET /api/seed', 'No', 'Seeds admin user and products'],
].forEach(([e, a, d]) => tableRow(e, a, d));

// ─── PAGE 7: DEPLOYMENT ───────────────────────────────────────────────────────
doc.addPage();

sectionTitle('7. Deployment & Infrastructure');

subTitle('Vercel Deployment');
const deployItems = [
  'Frontend and backend deployed as two separate Vercel projects under vishnu640s-projects organization',
  'Backend uses @vercel/node runtime — server.js exported as a serverless function',
  'Frontend uses react-scripts build with cross-env for environment compatibility',
  'Both projects auto-deploy from GitHub repository on every push to main branch',
  'Environment variables configured directly in Vercel project settings dashboard',
];
deployItems.forEach(d => bullet(d));

doc.moveDown(0.5);
subTitle('Serverless Architecture');
const serverlessItems = [
  'server.js uses isConnected flag to cache MongoDB connection across warm invocations',
  'connectDB() called via Express middleware before each request (not at startup)',
  'No app.listen() in production — Vercel handles the HTTP server lifecycle',
  'module.exports = app allows Vercel to import and invoke the Express app',
];
serverlessItems.forEach(s => bullet(s));

doc.moveDown(0.5);
subTitle('MongoDB Atlas Configuration');
const mongoItems = [
  'Cluster: cluster0.v4ykp90.mongodb.net (M0 Free Tier)',
  'Database name: vishalmart',
  'Network Access: 0.0.0.0/0 (allow all IPs — required for Vercel dynamic IPs)',
  'Connection string uses SRV format: mongodb+srv://...',
  'Mongoose connection options: retryWrites=true, w=majority',
];
mongoItems.forEach(m => bullet(m));

doc.moveDown(0.5);
subTitle('GitHub Repository');
bullet('Repository: https://github.com/Vishnu640/vishal-mart');
bullet('Monorepo structure with /frontend and /backend directories');
bullet('Separate vercel.json in each subdirectory for independent deployments');
bullet('.gitignore excludes node_modules, .env files, and build artifacts');

doc.moveDown(0.5);
subTitle('Environment Variables (Backend — Vercel)');
doc.moveDown(0.2);
tableRow('Variable', 'Value', 'Purpose', true);
[
  ['MONGO_URI', 'mongodb+srv://...', 'MongoDB Atlas connection string'],
  ['JWT_SECRET', 'Set in Vercel', 'Secret key for JWT signing'],
  ['PORT', '5001 (local only)', 'Local development server port'],
].forEach(([k, v, p]) => tableRow(k, v, p));

// ─── PAGE 8: SECURITY + STRUCTURE ────────────────────────────────────────────
doc.addPage();

sectionTitle('8. Security Implementation');
const secItems = [
  'Password Hashing: All passwords hashed using bcryptjs with salt rounds before storage',
  'JWT Authentication: Stateless tokens signed with secret key, verified on protected routes',
  'Role-Based Access Control: Admin routes protected by role check in authMiddleware',
  'CORS Configuration: Configured to allow cross-origin requests from frontend domain',
  'Environment Variables: Sensitive data (DB URI, JWT secret) stored in .env, never committed',
  'Input Validation: Required fields enforced at Mongoose schema level',
  'OTP Expiry: Password recovery OTPs have expiration timestamps to prevent replay attacks',
  'No SQL Injection: MongoDB with Mongoose eliminates SQL injection attack surface',
];
secItems.forEach(s => bullet(s));

doc.moveDown(1);
sectionTitle('9. Project Structure');

doc.fontSize(9).font('Courier').fillColor(DARK)
  .text(
`vishal-mart/
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js     # Axios instance with base URL
│   │   ├── components/
│   │   │   ├── Navbar.js    # Navigation bar component
│   │   │   ├── ProductCard.js
│   │   │   └── QRScanner.js
│   │   ├── context/
│   │   │   └── AuthContext.js  # Global auth state
│   │   └── pages/
│   │       ├── Home.js      # Product listing page
│   │       ├── Login.js     # Login form
│   │       ├── Register.js  # Registration form
│   │       ├── Cart.js      # Shopping cart
│   │       ├── Orders.js    # Order history
│   │       ├── AdminDashboard.js
│   │       ├── Settings.js  # Profile & password
│   │       ├── Feedback.js
│   │       └── Welcome.js
│   ├── .env.production      # REACT_APP_API_URL
│   └── vercel.json
│
└── backend/
    ├── config/
    │   └── db.js            # Mongoose connection
    ├── controllers/
    │   ├── authController.js
    │   ├── productController.js
    │   └── orderController.js
    ├── middleware/
    │   └── authMiddleware.js # JWT verification
    ├── models/
    │   ├── User.js          # Mongoose User schema
    │   ├── Product.js       # Mongoose Product schema
    │   └── Order.js         # Mongoose Order schema
    ├── routes/
    │   ├── authRoutes.js
    │   ├── productRoutes.js
    │   └── orderRoutes.js
    ├── seeder.js            # Product seed data
    ├── adminSeeder.js       # Admin user seeder
    ├── server.js            # Main Express app
    ├── .env                 # Local environment vars
    └── vercel.json`, { width: 495 });

// ─── PAGE 9: URLS + CHALLENGES ───────────────────────────────────────────────
doc.addPage();

sectionTitle('10. Live URLs & Credentials');

subTitle('Deployment URLs');
doc.moveDown(0.2);
tableRow('Service', 'URL', 'Status', true);
[
  ['Frontend', 'https://frontend-black-sigma-94.vercel.app', 'Live'],
  ['Backend API', 'https://backend-eight-chi-55.vercel.app', 'Live'],
  ['GitHub Repo', 'https://github.com/Vishnu640/vishal-mart', 'Public'],
  ['MongoDB Atlas', 'cluster0.v4ykp90.mongodb.net', 'Connected'],
].forEach(([s, u, st]) => tableRow(s, u, st));

doc.moveDown(1);
subTitle('Admin Credentials');
doc.moveDown(0.2);
tableRow('Field', 'Value', 'Notes', true);
[
  ['Email', 'admin@vishalmart.com', 'Admin login email'],
  ['Password', 'Admin@123', 'Admin login password'],
  ['Role', 'admin', 'Full access to dashboard'],
].forEach(([f, v, n]) => tableRow(f, v, n));

doc.moveDown(1);
sectionTitle('11. Challenges & Solutions');

const challenges = [
  {
    c: 'MySQL Port Blocked on Vercel',
    s: 'Vercel free tier blocks outbound TCP port 3306. Tried Railway, filess.io, Clever Cloud — all blocked. Migrated entire app from Sequelize/MySQL to Mongoose/MongoDB Atlas (port 27017 via SRV DNS — allowed).'
  },
  {
    c: 'Local Network Blocks MongoDB Port',
    s: 'Local network also blocks port 27017 and SRV DNS resolution. Created /api/seed HTTP endpoint on Vercel to seed data remotely without needing local DB access.'
  },
  {
    c: 'Serverless Cold Start & Connection Pooling',
    s: 'Mongoose creates new connections on every cold start. Implemented isConnected flag in server.js to cache and reuse existing connections across warm invocations.'
  },
  {
    c: 'Monorepo Build Issues on Vercel',
    s: 'Single Vercel project could not build both frontend and backend. Deployed as two separate Vercel projects with individual vercel.json configurations.'
  },
  {
    c: 'Duplicate Variable Declaration Bug',
    s: 'The /api/seed endpoint had duplicate const Product declaration causing a syntax error. Products returned empty array. Fixed by removing the duplicate require statement.'
  },
  {
    c: 'Cross-Platform Build Scripts',
    s: 'Windows development environment caused issues with environment variable syntax in npm scripts. Added cross-env package to normalize env var syntax across platforms.'
  },
];

challenges.forEach(({ c, s }) => {
  doc.fillColor(BLUE).fontSize(10).font('Helvetica-Bold').text(`▶ ${c}`, { width: 495 });
  doc.fillColor(DARK).font('Helvetica').fontSize(9).text(s, 70, doc.y, { width: 475 }).moveDown(0.6);
});

// ─── PAGE 10: CONCLUSION ──────────────────────────────────────────────────────
doc.addPage();

sectionTitle('12. Conclusion');
doc.fontSize(10).fillColor(DARK).font('Helvetica')
  .text('Vishal Mart successfully demonstrates a complete, production-ready e-commerce application built with modern web technologies. The project covers the full software development lifecycle — from local development to cloud deployment.', { width: 495 })
  .moveDown(0.8);

doc.text('Key achievements of this project:', { width: 495 }).moveDown(0.3);
const achievements = [
  'Full-stack application with React frontend and Node.js/Express backend',
  'Cloud database integration with MongoDB Atlas',
  'Serverless deployment on Vercel with proper connection caching',
  'JWT-based authentication with role-based access control',
  'Complete admin dashboard for product, order, and user management',
  'Real-world problem solving — database migration, network restrictions, deployment issues',
  'Version control with GitHub and CI/CD via Vercel auto-deploy',
];
achievements.forEach(a => bullet(a));

doc.moveDown(1);
doc.text('The project demonstrates proficiency in:', { width: 495 }).moveDown(0.3);
const skills = [
  'React.js — component architecture, hooks, context API, routing',
  'Node.js & Express.js — RESTful API design, middleware, routing',
  'MongoDB & Mongoose — schema design, CRUD operations, population',
  'Authentication — JWT tokens, bcrypt hashing, OTP flows',
  'Cloud deployment — Vercel, MongoDB Atlas, environment configuration',
  'DevOps basics — Git, GitHub, environment variables, serverless functions',
];
skills.forEach(s => bullet(s));

doc.moveDown(1.5);
doc.rect(50, doc.y, 495, 60).fill(BLUE);
doc.fillColor(WHITE).fontSize(12).font('Helvetica-Bold')
  .text('Vishal Mart — Full Stack E-Commerce Project', 60, doc.y - 50, { width: 475, align: 'center' });
doc.fontSize(10).font('Helvetica')
  .text('React.js  •  Node.js  •  MongoDB Atlas  •  Vercel', 60, doc.y - 5, { width: 475, align: 'center' });
doc.fillColor(GRAY).fontSize(9)
  .text('https://frontend-black-sigma-94.vercel.app', 60, doc.y + 5, { width: 475, align: 'center' });

// ─── PAGE NUMBERS ─────────────────────────────────────────────────────────────
const totalPages = doc.bufferedPageRange().count + 1;
for (let i = 1; i < doc._pageBuffer.length; i++) {
  doc.switchToPage(i);
  doc.fillColor(GRAY).fontSize(8).font('Helvetica')
    .text(`Page ${i} | Vishal Mart Project Report`, 50, 770, { width: 495, align: 'center' });
}

doc.end();
console.log('PDF generated: ' + outputPath);

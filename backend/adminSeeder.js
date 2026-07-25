require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ email: 'admin@vishalmart.com' });
  const hashed = await bcrypt.hash('Admin@123', 10);
  if (existing) {
    await User.findByIdAndUpdate(existing._id, { password: hashed, role: 'admin', isVerified: true });
    console.log('✅ Admin password reset to: Admin@123');
  } else {
    await User.create({ name: 'Admin', email: 'admin@vishalmart.com', password: hashed, role: 'admin', isVerified: true });
    console.log('✅ Admin user created!');
  }
  console.log('📧 Email: admin@vishalmart.com');
  console.log('🔑 Password: Admin@123');
  process.exit(0);
})().catch(err => { console.error('❌', err.message); process.exit(1); });

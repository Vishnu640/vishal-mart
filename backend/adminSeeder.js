const { connectDB } = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

(async () => {
  await connectDB();
  const existing = await User.findOne({ where: { email: 'admin@vishalmart.com' } });
  if (existing) {
    const hashed = await bcrypt.hash('Admin@123', 10);
    await existing.update({ password: hashed, role: 'admin', isVerified: true });
    console.log('✅ Admin password reset to: Admin@123');
  } else {
    const hashed = await bcrypt.hash('Admin@123', 10);
    await User.create({ name: 'Admin', email: 'admin@vishalmart.com', password: hashed, role: 'admin', isVerified: true });
    console.log('✅ Admin user created!');
  }
  console.log('📧 Email: admin@vishalmart.com');
  console.log('🔑 Password: Admin@123');
  process.exit(0);
})().catch(err => { console.error('❌', err.message); process.exit(1); });

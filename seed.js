const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@salo.edu';
  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log('Admin already exists: admin@salo.edu / Admin@123');
    await mongoose.disconnect();
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@salo.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  await User.create({
    name: 'System Administrator',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    department: 'Administration',
  });

  console.log('✅ Admin seeded successfully!');
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });

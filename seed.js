const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: 'admin@salo.edu' });
  if (existing) {
    console.log('Admin already exists: admin@salo.edu / Admin@123');
    await mongoose.disconnect();
    return;
  }

  await User.create({
    name: 'System Administrator',
    email: 'admin@salo.edu',
    password: 'Admin@123',
    role: 'admin',
    department: 'Administration',
  });

  console.log('✅ Admin seeded successfully!');
  console.log('   Email:    admin@salo.edu');
  console.log('   Password: Admin@123');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });

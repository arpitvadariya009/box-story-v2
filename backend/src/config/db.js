const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/boxstories');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed default users if they don't exist
    const User = require('../models/User');
    const defaults = [
      { name: 'Super Admin', email: 'superadmin@boxstories.com', password: 'password123', role: 'SuperAdmin' },
      { name: 'Admin', email: 'admin@boxstories.com', password: 'password123', role: 'Admin' },
      { name: 'John BDM', email: 'bdm@boxstories.com', password: 'password123', role: 'BDM' },
    ];
    for (const u of defaults) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const hashed = await bcrypt.hash(u.password, 10);
        await User.create({ name: u.name, email: u.email, password: hashed, role: u.role, status: 'Active' });
        console.log(`[Seed] Created default user: ${u.email}`);
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

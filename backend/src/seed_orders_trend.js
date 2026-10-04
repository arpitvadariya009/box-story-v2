const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Client = require('./models/Client');
const Product = require('./models/Product');
const Order = require('./models/Order');

async function seedOrdersTrend() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://arpitvadariya003:808280@cluster0.plaliru.mongodb.net/boxstories';
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Fetch existing client or create sample
    let client = await Client.findOne({});
    if (!client) {
      client = await Client.create({
        companyName: 'Acme Corporation',
        contactPerson: 'John Doe',
        email: 'john@acme.com',
        phone: '+91 9876543210',
        address: { street: '123 Tech Park', city: 'Mumbai', state: 'MH', zipCode: '400001', country: 'India' },
        status: 'Active',
      });
    }

    // Fetch existing user or create sample
    let user = await User.findOne({});
    if (!user) {
      user = await User.create({
        name: 'Super Admin User',
        email: 'admin@boxstories.com',
        password: 'password123',
        role: 'SuperAdmin',
      });
    }

    // Fetch existing product or create sample
    let product = await Product.findOne({});
    if (!product) {
      product = await Product.create({
        name: 'Premium Welcome Gift Kit',
        sku: 'BOX-PREM-001',
        description: 'Deluxe onboarding kit',
        category: 'Welcome Kits',
        basePrice: 50.0,
        status: 'Available',
      });
    }

    console.log('Generating dummy orders for the last 12 months...');

    const now = new Date();
    // Monthly configurations: [totalOrders, completedOrders]
    const monthlyConfigs = [
      { monthsAgo: 11, total: 95, completed: 82 },
      { monthsAgo: 10, total: 110, completed: 96 },
      { monthsAgo: 9, total: 125, completed: 110 },
      { monthsAgo: 8, total: 140, completed: 122 },
      { monthsAgo: 7, total: 155, completed: 135 },
      { monthsAgo: 6, total: 170, completed: 148 },
      { monthsAgo: 5, total: 190, completed: 164 }, // Apr (e.g. 190 total, 26 pending, 164 completed)
      { monthsAgo: 4, total: 175, completed: 152 },
      { monthsAgo: 3, total: 185, completed: 160 },
      { monthsAgo: 2, total: 210, completed: 182 },
      { monthsAgo: 1, total: 195, completed: 168 },
      { monthsAgo: 0, total: 145, completed: 120 },
    ];

    let totalInserted = 0;

    for (const conf of monthlyConfigs) {
      const targetMonthDate = new Date(now.getFullYear(), now.getMonth() - conf.monthsAgo, 15);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - conf.monthsAgo, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - conf.monthsAgo + 1, 1);

      // Check if orders already exist in this month
      const existingCount = await Order.countDocuments({
        createdAt: { $gte: startOfMonth, $lt: endOfMonth },
      });

      const needed = Math.max(0, conf.total - existingCount);
      if (needed === 0) {
        console.log(`Month -${conf.monthsAgo} already has ${existingCount} orders.`);
        continue;
      }

      const ordersToInsert = [];
      const pendingCount = conf.total - conf.completed;

      for (let i = 0; i < needed; i++) {
        const day = Math.min(28, Math.floor(Math.random() * 26) + 1);
        const hour = Math.floor(Math.random() * 12) + 9;
        const minute = Math.floor(Math.random() * 59);
        const orderDate = new Date(now.getFullYear(), now.getMonth() - conf.monthsAgo, day, hour, minute);

        const isCompleted = i < Math.round((conf.completed / conf.total) * needed);
        const status = isCompleted
          ? (Math.random() > 0.2 ? 'Delivered' : 'Dispatched')
          : (Math.random() > 0.5 ? 'Pending Approval' : 'In Production');

        const qty = Math.floor(Math.random() * 10) + 1;
        const unitPrice = product.basePrice || 50;
        const subtotal = qty * unitPrice;
        const tax = +(subtotal * 0.18).toFixed(2);
        const totalAmount = +(subtotal + tax).toFixed(2);

        const orderNum = `ORD-${orderDate.getFullYear()}${(orderDate.getMonth() + 1).toString().padStart(2, '0')}-${String(existingCount + i + 1).padStart(4, '0')}`;

        ordersToInsert.push({
          orderNumber: orderNum,
          client: client._id,
          orderedBy: user._id,
          items: [
            {
              product: product._id,
              quantity: qty,
              price: unitPrice,
            },
          ],
          subtotal,
          tax,
          shippingCost: 0,
          totalAmount,
          status,
          priority: Math.random() > 0.8 ? 'Urgent' : 'Normal',
          shippingAddress: {
            street: '123 Business Avenue',
            city: 'Mumbai',
            state: 'MH',
            zipCode: '400001',
            country: 'India',
          },
          createdAt: orderDate,
          updatedAt: orderDate,
        });
      }

      if (ordersToInsert.length > 0) {
        await Order.insertMany(ordersToInsert);
        totalInserted += ordersToInsert.length;
        console.log(`Inserted ${ordersToInsert.length} orders for ${targetMonthDate.toLocaleString('default', { month: 'short', year: 'numeric' })}.`);
      }
    }

    console.log(`Successfully seeded ${totalInserted} dummy orders!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding orders data:', error);
    process.exit(1);
  }
}

seedOrdersTrend();

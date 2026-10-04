const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Client = require('./models/Client');
const Product = require('./models/Product');
const Order = require('./models/Order');

async function seedCategoryDemand() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://arpitvadariya003:808280@cluster0.plaliru.mongodb.net/boxstories';
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Fetch or create sample client & user
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

    let user = await User.findOne({});
    if (!user) {
      user = await User.create({
        name: 'Super Admin User',
        email: 'admin@boxstories.com',
        password: 'password123',
        role: 'SuperAdmin',
      });
    }

    // Ensure products exist in each category
    const categoryProducts = [
      { name: 'Wireless Fast Power Bank 10000mAh', category: 'Electronics', sku: 'ELEC-PB-001', basePrice: 45 },
      { name: 'Noise-Cancelling Bluetooth Earbuds', category: 'Electronics', sku: 'ELEC-EB-002', basePrice: 60 },
      { name: 'Smart Temperature Control Mug', category: 'Electronics', sku: 'ELEC-MG-003', basePrice: 35 },
      { name: 'Premium Embroidered Corporate Polo', category: 'Apparel', sku: 'APP-POLO-001', basePrice: 30 },
      { name: 'Heavyweight Cotton Fleece Hoodie', category: 'Apparel', sku: 'APP-HOOD-002', basePrice: 45 },
      { name: 'Breathable Tech Windbreaker Jacket', category: 'Apparel', sku: 'APP-WIND-003', basePrice: 55 },
      { name: 'Ultrasonic Aromatherapy Oil Diffuser', category: 'Wellness', sku: 'WEL-DIFF-001', basePrice: 28 },
      { name: 'Organic Herbal Infusion Tea Set', category: 'Wellness', sku: 'WEL-TEA-002', basePrice: 22 },
      { name: 'Ergonomic Memory Foam Lumbar Cushion', category: 'Wellness', sku: 'WEL-CUSH-003', basePrice: 32 },
      { name: 'Artisanal Belgian Truffle Collection', category: 'Gourmet', sku: 'GOUR-CHOC-001', basePrice: 25 },
      { name: 'Royal Roasted Dry Fruit Gift Jar', category: 'Gourmet', sku: 'GOUR-NUTS-002', basePrice: 35 },
      { name: 'Single-Origin Pour-Over Coffee Kit', category: 'Gourmet', sku: 'GOUR-COFF-003', basePrice: 28 },
    ];

    const seededProducts = [];
    for (const p of categoryProducts) {
      let existing = await Product.findOne({ sku: p.sku });
      if (!existing) {
        existing = await Product.create({
          name: p.name,
          category: p.category,
          sku: p.sku,
          description: `High quality ${p.category.toLowerCase()} item`,
          basePrice: p.basePrice,
          status: 'Available',
        });
      }
      seededProducts.push(existing);
    }
    console.log(`Ensured ${seededProducts.length} categorized products.`);

    const now = new Date();
    const ordersToInsert = [];

    // Seed 120 orders across the last 12 months (10 orders per month with realistic item counts)
    for (let m = 0; m < 12; m++) {
      for (let o = 0; o < 10; o++) {
        const day = Math.min(28, Math.floor(Math.random() * 26) + 1);
        const orderDate = new Date(now.getFullYear(), now.getMonth() - m, day, 10 + (o % 8), (o * 5) % 60);

        const items = [];
        // Add 2-4 categorized products per order with varying quantities
        const pickedProds = [...seededProducts].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2);
        let subtotal = 0;

        for (const prod of pickedProds) {
          const qty = Math.floor(Math.random() * 8) + 2;
          const price = prod.basePrice || 30;
          subtotal += qty * price;
          items.push({
            product: prod._id,
            quantity: qty,
            price: price,
          });
        }

        const tax = +(subtotal * 0.18).toFixed(2);
        const totalAmount = +(subtotal + tax).toFixed(2);
        const orderNum = `CAT-ORD-${orderDate.getFullYear()}${(orderDate.getMonth() + 1).toString().padStart(2, '0')}-${String(m * 10 + o + 1).padStart(4, '0')}`;

        ordersToInsert.push({
          orderNumber: orderNum,
          client: client._id,
          orderedBy: user._id,
          items,
          subtotal,
          tax,
          shippingCost: 0,
          totalAmount,
          status: Math.random() > 0.2 ? 'Delivered' : 'In Production',
          priority: 'Normal',
          shippingAddress: {
            street: '456 Corporate Towers',
            city: 'Bangalore',
            state: 'KA',
            zipCode: '560001',
            country: 'India',
          },
          createdAt: orderDate,
          updatedAt: orderDate,
        });
      }
    }

    console.log(`Inserting ${ordersToInsert.length} dummy category orders...`);
    await Order.insertMany(ordersToInsert);
    console.log('Successfully seeded 120 dummy category orders in database!');

    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedCategoryDemand();

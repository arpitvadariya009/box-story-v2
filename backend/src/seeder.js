const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Models
const User = require('./models/User');
const Client = require('./models/Client');
const Product = require('./models/Product');
const Inventory = require('./models/Inventory');
const Catalogue = require('./models/Catalogue');
const Order = require('./models/Order');
const Invoice = require('./models/Invoice');
const Vendor = require('./models/Vendor');
const PurchaseOrder = require('./models/PurchaseOrder');
const GoodsReceipt = require('./models/GoodsReceipt');
const DesignJob = require('./models/DesignJob');
const ClientCommunication = require('./models/ClientCommunication');
const PickList = require('./models/PickList');
const PackingSlip = require('./models/PackingSlip');
const Dispatch = require('./models/Dispatch');
const WarehouseException = require('./models/WarehouseException');
const GiftSelection = require('./models/GiftSelection');
const Notification = require('./models/Notification');
const Setting = require('./models/Setting');
const AuditLog = require('./models/AuditLog');
const Report = require('./models/Report');
const EWayBill = require('./models/EWayBill');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/boxstories');

    // Clear existing data
    console.log('Clearing database...');
    await User.deleteMany();
    await Client.deleteMany();
    await Product.deleteMany();
    await Inventory.deleteMany();
    await Catalogue.deleteMany();
    await Order.deleteMany();
    await Invoice.deleteMany();
    await Vendor.deleteMany();
    await PurchaseOrder.deleteMany();
    await GoodsReceipt.deleteMany();
    await DesignJob.deleteMany();
    await ClientCommunication.deleteMany();
    await PickList.deleteMany();
    await PackingSlip.deleteMany();
    await Dispatch.deleteMany();
    await WarehouseException.deleteMany();
    await GiftSelection.deleteMany();
    await Notification.deleteMany();
    await Setting.deleteMany();
    await AuditLog.deleteMany();
    await Report.deleteMany();
    await EWayBill.deleteMany();

    console.log('Inserting Clients...');
    const clients = await Client.insertMany([
      {
        companyName: 'Acme Corp',
        contactPerson: 'John Doe',
        email: 'john@acme.com',
        phone: '+1 555-0199',
        address: {
          street: '123 Acme Way',
          city: 'Silicon Valley',
          state: 'CA',
          zipCode: '94025',
          country: 'USA',
        },
        billingAddress: {
          street: '123 Acme Way',
          city: 'Silicon Valley',
          state: 'CA',
          zipCode: '94025',
          country: 'USA',
        },
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
        gstin: '27ACME1234A1Z1',
        pan: 'AABC1234A',
        industry: 'Technology',
        creditLimit: 50000,
        paymentTerms: 'Net 30',
        status: 'Active',
      },
      {
        companyName: 'Globex Industries',
        contactPerson: 'Sarah Jenkins',
        email: 'sarah@globex.com',
        phone: '+1 555-0288',
        address: {
          street: '456 Globex Tower',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        billingAddress: {
          street: '456 Globex Tower',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&auto=format&fit=crop&q=60',
        gstin: '27GLO1234B1Z2',
        pan: 'BABC1234B',
        industry: 'Manufacturing',
        creditLimit: 100000,
        paymentTerms: 'Net 45',
        status: 'Active',
      },
    ]);

    console.log('Inserting Users (10 Roles)...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      {
        name: 'Super Admin User',
        email: 'superadmin@boxstories.com',
        password: hashedPassword,
        role: 'SuperAdmin',
        status: 'Active',
      },
      {
        name: 'Admin User',
        email: 'admin@boxstories.com',
        password: hashedPassword,
        role: 'Admin',
        status: 'Active',
      },
      {
        name: 'BDM User',
        email: 'bdm@boxstories.com',
        password: hashedPassword,
        role: 'BDM',
        status: 'Active',
      },
      {
        name: 'Procurement User',
        email: 'procurement@boxstories.com',
        password: hashedPassword,
        role: 'Procurement',
        status: 'Active',
      },
      {
        name: 'Warehouse Logistics Member',
        email: 'warehouse@boxstories.com',
        password: hashedPassword,
        role: 'WarehouseLogistics',
        status: 'Active',
      },
      {
        name: 'Designer Member',
        email: 'designer@boxstories.com',
        password: hashedPassword,
        role: 'DesignCustomisation',
        status: 'Active',
      },
      {
        name: 'Data Entry Operator',
        email: 'dataentry@boxstories.com',
        password: hashedPassword,
        role: 'DataEntryOperator',
        status: 'Active',
      },
      {
        name: 'Accounts Team Member',
        email: 'accounts@boxstories.com',
        password: hashedPassword,
        role: 'AccountsTeam',
        status: 'Active',
      },
      {
        name: 'Corporate HR Manager Acme',
        email: 'hr@boxstories.com',
        password: hashedPassword,
        role: 'CorporateHRManager',
        client: clients[0]._id,
        status: 'Active',
      },
      {
        name: 'Employee Acme',
        email: 'employee@boxstories.com',
        password: hashedPassword,
        role: 'Employee',
        client: clients[0]._id,
        status: 'Active',
      },
    ]);

    // Link assigned BDM to Client
    clients[0].assignedBDM = users[2]._id;
    await clients[0].save();

    console.log('Inserting Vendors...');
    const vendors = await Vendor.insertMany([
      {
        name: 'Gifting World Pvt Ltd',
        contactPerson: 'Ramesh Agarwal',
        email: 'ramesh@giftingworld.com',
        phone: '+91 98765 43210',
        productsCount: 45,
        paymentTerms: 'Net 30',
        rating: 4.5,
        status: 'Active',
      },
      {
        name: 'PrintMaster India',
        contactPerson: 'Sunil Joshi',
        email: 'sunil@printmaster.in',
        phone: '+91 87654 32109',
        productsCount: 28,
        paymentTerms: 'Net 15',
        rating: 4.2,
        status: 'Active',
      },
      {
        name: 'EcoPack Solutions',
        contactPerson: 'Meera Kulkarni',
        email: 'meera@ecopack.in',
        phone: '+91 76543 21098',
        productsCount: 15,
        paymentTerms: 'Net 45',
        rating: 3.8,
        status: 'Active',
      },
      {
        name: 'Artisan Crafts Co',
        contactPerson: 'Pooja Desai',
        email: 'pooja@artisancrafts.com',
        phone: '+91 65432 10987',
        productsCount: 32,
        paymentTerms: 'Net 30',
        rating: 4.7,
        status: 'Active',
      },
      {
        name: 'Premium Imports Ltd',
        contactPerson: 'Nikhil Shah',
        email: 'nikhil@premiumimports.com',
        phone: '+91 54321 09876',
        productsCount: 20,
        paymentTerms: 'Advance',
        rating: 4.0,
        status: 'Inactive',
      },
      {
        name: 'BrandIt Solutions',
        contactPerson: 'Arun Verma',
        email: 'arun@brandit.in',
        phone: '+91 43210 98765',
        productsCount: 18,
        paymentTerms: 'Net 30',
        rating: 3.5,
        status: 'Active',
      },
    ]);

    console.log('Inserting Products...');
    const products = await Product.insertMany([
      {
        name: 'Eco-Friendly Premium Welcome Box',
        sku: 'BOX-ECO-001',
        description: 'A premium corporate welcome box made from sustainable materials.',
        category: 'Welcome Kits',
        basePrice: 45.0,
        images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60'],
        dimensions: { length: 30, width: 22, height: 10, weight: 1.2 },
        isCustomizable: true,
        customizationOptions: [{ type: 'Logo Printing', label: 'Gold Embossed Logo', additionalCost: 5.0 }],
        vendor: vendors[0]._id,
        hsnCode: '48191010',
        gstRate: 18,
        status: 'Available',
      },
      {
        name: 'Office Essentials Kit',
        sku: 'BOX-OFF-002',
        description: 'Daily office essential kit containing desk accessories.',
        category: 'Office Kits',
        basePrice: 35.0,
        images: ['https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=500&auto=format&fit=crop&q=60'],
        dimensions: { length: 25, width: 20, height: 8, weight: 0.9 },
        vendor: vendors[1]._id,
        hsnCode: '48201010',
        gstRate: 18,
        status: 'Available',
      },
    ]);

    console.log('Setting up Inventory...');
    await Inventory.insertMany([
      {
        product: products[0]._id,
        availableQty: 120,
        reservedQty: 10,
        reorderLevel: 20,
        binLocation: 'A-Shelf-04',
        warehouseLocation: 'Mumbai Fulfillment Center',
        zone: 'A',
        rack: '04',
        shelf: '2',
        history: [{ type: 'Inbound', quantity: 130, reference: 'Initial Seed' }],
      },
      {
        product: products[1]._id,
        availableQty: 80,
        reservedQty: 5,
        reorderLevel: 15,
        binLocation: 'B-Shelf-02',
        warehouseLocation: 'Mumbai Fulfillment Center',
        zone: 'B',
        rack: '02',
        shelf: '1',
        history: [{ type: 'Inbound', quantity: 85, reference: 'Initial Seed' }],
      },
    ]);

    console.log('Creating Custom Client Catalogues...');
    const catalogues = await Catalogue.insertMany([
      {
        name: 'Acme Curated Gifting Catalogue',
        client: clients[0]._id,
        products: [
          { product: products[0]._id, clientPrice: 42.0 },
          { product: products[1]._id, clientPrice: 32.5 },
        ],
        activeFrom: new Date(),
        activeTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        budget: 50.0,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: users[8]._id,
        status: 'Active',
      },
    ]);

    console.log('Creating Sample Orders...');
    const order = await Order.create({
      orderNumber: 'ORD-2026-0001',
      client: clients[0]._id,
      orderedBy: users[9]._id, // Employee Acme
      items: [
        {
          product: products[0]._id,
          quantity: 10,
          price: 42.0,
          customizationDetails: { brandingType: 'Logo Printing', logo: 'http://example.com/acme-logo.png' },
        },
      ],
      subtotal: 420.0,
      tax: 75.6,
      shippingCost: 0,
      totalAmount: 495.6,
      status: 'Pending Approval',
      shippingAddress: {
        street: '123 Acme Way',
        city: 'Silicon Valley',
        state: 'CA',
        zipCode: '94025',
        country: 'USA',
      },
    });

    console.log('Creating Purchase Order (Procurement)...');
    const po = await PurchaseOrder.create({
      poNumber: 'PO-2026-0001',
      vendor: vendors[0]._id,
      items: [{ product: products[0]._id, quantity: 100, unitPrice: 30.0, total: 3000.0 }],
      totalAmount: 3000.0,
      status: 'Approved',
      createdBy: users[3]._id,
      approvedBy: users[0]._id,
      approvedAt: new Date(),
    });

    console.log('Creating Goods Receipt Note (GRN)...');
    await GoodsReceipt.create({
      grnNumber: 'GRN-2026-0001',
      purchaseOrder: po._id,
      vendor: vendors[0]._id,
      receivedItems: [{ product: products[0]._id, orderedQty: 100, receivedQty: 100, acceptedQty: 100 }],
      receivedBy: users[4]._id,
      status: 'Accepted',
    });

    console.log('Creating Design Job...');
    await DesignJob.create({
      jobNumber: 'DSN-2026-0001',
      order: order._id,
      client: clients[0]._id,
      assignedTo: users[5]._id,
      type: 'Logo Printing',
      specifications: 'Gold emboss Acme logo center of welcoming box lid.',
      status: 'Proof Sent',
      proofs: [{ version: 1, imageUrl: 'http://example.com/proof1.png', status: 'Pending' }],
    });

    console.log('Creating Gift Selection...');
    await GiftSelection.create({
      employee: users[9]._id,
      client: clients[0]._id,
      catalogue: catalogues[0]._id,
      selectedProducts: [{ product: products[0]._id, quantity: 1 }],
      budget: 50.0,
      totalValue: 42.0,
      occasion: 'Welcome',
      status: 'Selected',
    });

    console.log('Creating Sample Invoices...');
    await Invoice.create({
      invoiceNumber: 'INV-2026-0001',
      order: order._id,
      client: clients[0]._id,
      amountDue: 495.6,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Unpaid',
    });

    console.log('Setting Default Configurations...');
    await Setting.insertMany([
      { key: 'platform_name', value: 'BoxStories Gifting Portal', category: 'General' },
      { key: 'tax_rate_percent', value: 18, category: 'Tax' },
    ]);

    console.log('Database Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();

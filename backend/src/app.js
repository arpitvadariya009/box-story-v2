const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to BoxStories B2B API Server' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/purchase-orders', require('./routes/purchaseOrderRoutes'));
app.use('/api/goods-receipts', require('./routes/goodsReceiptRoutes'));
app.use('/api/design-jobs', require('./routes/designJobRoutes'));
app.use('/api/communications', require('./routes/communicationRoutes'));
app.use('/api/warehouse', require('./routes/warehouseRoutes'));
app.use('/api/data-entry', require('./routes/dataEntryRoutes'));
app.use('/api/gift-selections', require('./routes/giftSelectionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/eway-bills', require('./routes/ewayBillRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/accounts', require('./routes/accountsRoutes'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;

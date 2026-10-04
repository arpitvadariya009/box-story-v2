const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, 'src/.env') });

const productSchema = new mongoose.Schema({ name: String, category: String, description: String, basePrice: Number, images: [String], status: String, sku: String });
const Product = mongoose.model('Product', productSchema);

async function updateProductImages() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const updates = [
    {
      name: 'Premium Gift Box Collection',
      category: 'Gift Boxes',
      description: 'A luxurious curated gift box featuring premium artisanal products. Includes gourmet treats, a scented candle, and specialty items — beautifully packaged with a red ribbon.',
      images: [
        'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      name: 'Executive Leather Notebook & Pen Set',
      category: 'Stationery',
      description: 'Handcrafted executive Italian leather notebook paired with a precision-weighted luxury rollerball pen. Perfect for corporate journaling and daily meetings.',
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      name: 'Wireless Noise-Cancelling Headphones',
      category: 'Electronics',
      description: 'Studio-quality active noise-cancelling wireless headphones with 40-hour battery life, ultra-comfortable memory foam earcups, and crystal-clear microphone.',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      name: 'Classic Smartwatch',
      category: 'Electronics',
      description: 'Elegant aerospace-grade smartwatch with always-on AMOLED display, comprehensive heart-rate tracking, sleep insights, and 14-day battery reserve.',
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      name: 'Professional Travel Backpack',
      category: 'Travel',
      description: 'Water-resistant ergonomic travel backpack with padded 16-inch laptop sleeve, TSA-approved locks, hidden anti-theft pocket, and USB charging pass-through.',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      name: 'Premium Espresso Machine',
      category: 'Home & Kitchen',
      description: '15-bar Italian pump espresso maker with integrated milk frother, rapid thermoblock heating, and customizable shot volumes for barista-grade coffee.',
      images: [
        'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&auto=format&fit=crop&q=80'
      ]
    }
  ];

  for (const u of updates) {
    await Product.findOneAndUpdate({ name: u.name }, { $set: { images: u.images, description: u.description, category: u.category } });
    console.log('Updated product in DB:', u.name);
  }

  await mongoose.disconnect();
}
updateProductImages().catch(console.error);

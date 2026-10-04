const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, 'src/.env') });

const mapping = {
  'BOX-PREM-001': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500',
  'ELEC-PB-001': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500',
  'ELEC-EB-002': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
  'ELEC-MG-003': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500',
  'APP-POLO-001': 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500',
  'APP-HOOD-002': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500',
  'APP-WIND-003': 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500',
  'WEL-DIFF-001': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500',
  'WEL-TEA-002': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500',
  'WEL-CUSH-003': 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500',
  'GOUR-CHOC-001': 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500',
  'GOUR-NUTS-002': 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500',
  'GOUR-COFF-003': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500'
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  for (const [sku, img] of Object.entries(mapping)) {
    const res = await mongoose.connection.collection('products').updateOne(
      { sku },
      { $set: { images: [img] } }
    );
    console.log(`Updated ${sku}: modified ${res.modifiedCount}`);
  }
  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(console.error);

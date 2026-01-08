import 'dotenv/config';
import connectDB from '../config/db.js';
import GalleryItem from '../models/GalleryItem.js';

(async function(){
  try {
    await connectDB(process.env.MONGO_URI);
    const items = await GalleryItem.find().limit(50).lean();
    console.log('Gallery items:', items.map(i => ({ _id: i._id, title: i.title, imageUrl: i.imageUrl, category: i.category })));
    process.exit(0);
  } catch (err) {
    console.error('Error listing gallery items', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
import 'dotenv/config';
import connectDB from '../config/db.js';
import GalleryItem from '../models/GalleryItem.js';

(async function(){
  try {
    await connectDB(process.env.MONGO_URI);
    const items = await GalleryItem.find({ imageUrl: { $regex: '^/upload/' } }).lean();
    console.log('Found', items.length, 'items with /upload/ prefix');
    for (const it of items) {
      const newUrl = it.imageUrl.replace(/^\/upload\//, '/uploads/');
      await GalleryItem.findByIdAndUpdate(it._id, { imageUrl: newUrl });
      console.log('Updated', it._id.toString(), '->', newUrl);
    }
    console.log('Migration finished');
    process.exit(0);
  } catch (err) {
    console.error('Migration error', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
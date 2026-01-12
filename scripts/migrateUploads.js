import 'dotenv/config';
import connectDB from '../config/db.js';
import GalleryItem from '../models/GalleryItem.js';

(async function(){
  try {
    await connectDB(process.env.MONGO_URI);

    // 1) Convert legacy `imageUrl` -> `images: [imageUrl]` and normalize /upload/ -> /uploads/
    const legacy = await GalleryItem.find({ imageUrl: { $exists: true } }).lean();
    console.log('Found', legacy.length, 'items with legacy imageUrl');
    for (const it of legacy) {
      const base = it.imageUrl ? it.imageUrl.replace(/^\/upload\//, '/uploads/') : null;
      const images = base ? [base] : [];
      await GalleryItem.findByIdAndUpdate(it._id, { $set: { images }, $unset: { imageUrl: "" } });
      console.log('Converted', it._id.toString());
    }

    // 2) Normalize any existing images[] entries with /upload/ prefix
    const items = await GalleryItem.find({ images: { $elemMatch: { $regex: '^/upload/' } } }).lean();
    console.log('Found', items.length, 'items with images elements using /upload/ prefix');
    for (const it of items) {
      const newImgs = (it.images || []).map(u => u ? u.replace(/^\/upload\//, '/uploads/') : u);
      await GalleryItem.findByIdAndUpdate(it._id, { images: newImgs.slice(0,6) });
      console.log('Normalized', it._id.toString());
    }

    console.log('Migration finished');
    process.exit(0);
  } catch (err) {
    console.error('Migration error', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
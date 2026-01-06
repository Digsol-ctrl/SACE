import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, default: 'Uncategorized' },
  caption: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.GalleryItem || mongoose.model('GalleryItem', gallerySchema);

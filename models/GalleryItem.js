import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  images: {
    type: [String],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length >= 1 && v.length <= 6;
      },
      message: 'A project must have between 1 and 6 images.'
    },
    required: true,
    default: []
  },
  category: { type: String, default: 'Uncategorized' },
  caption: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.GalleryItem || mongoose.model('GalleryItem', gallerySchema);

import GalleryItem from '../models/GalleryItem.js';

export async function projects(req, res, next) {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 }).lean();
    res.render('projects', { title: 'Our Projects', projects: items });
  } catch (err) {
    next(err);
  }
}

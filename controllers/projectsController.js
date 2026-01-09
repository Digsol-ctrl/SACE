import GalleryItem from '../models/GalleryItem.js';

export async function projects(req, res, next) {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 }).lean();
    // Provide both `items` and `projects` for templates and compatibility
    res.render('projects', { title: 'Our Projects', items, projects: items });
  } catch (err) {
    next(err);
  }
}

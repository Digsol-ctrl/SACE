import Service from '../models/Service.js';
import GalleryItem from '../models/GalleryItem.js';

export async function home(req, res, next) {
  try {
    const services = await Service.find().limit(6);

    // Prefer DB gallery items; if none exist, use a small static fallback
    let gallery = await GalleryItem.aggregate([{ $sample: { size: 6 } }]);
    
    const totalProjects = await GalleryItem.countDocuments();

    if (!gallery || gallery.length === 0) {
      gallery = [
        { imageUrl: '/images/construction_team.webp', title: 'Modern Villa', category: 'Residential' },
        { imageUrl: '/images/construction_team.webp', title: 'Office Complex', category: 'Commercial' },
        { imageUrl: '/images/construction_team.webp', title: 'Kitchen Remodel', category: 'Renovation' }
      ];
    }

    res.render('home', {
       title: 'Simply Amazing Construction & Engineering | Building Excellence',
       services,
       gallery,
       hasMoreProjects: totalProjects > gallery.length
        });
  } catch (err) {
    next(err);
  }
}

import Service from '../models/Service.js';
import GalleryItem from '../models/GalleryItem.js';

export async function home(req, res, next) {
  try {
    const services = await Service.find().limit(6);

    // Prefer DB gallery items; if none exist, use a small static fallback
    let gallery = await GalleryItem.find().sort({ createdAt: -1 }).limit(9);
    if (!gallery || gallery.length === 0) {
      gallery = [
        { imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', title: 'Modern Villa', category: 'Residential' },
        { imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', title: 'Office Complex', category: 'Commercial' },
        { imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', title: 'Kitchen Remodel', category: 'Renovation' }
      ];
    }

    res.render('home', { title: 'Simply Amazing Construction & Engineering | Building Excellence', services, gallery });
  } catch (err) {
    next(err);
  }
}

import 'dotenv/config';
import connectDB from '../config/db.js';
import Service from '../models/Service.js';
import GalleryItem from '../models/GalleryItem.js';

const servicesData = [
  { title: 'General Contracting', slug: 'general-contracting', description: 'Full-service construction management.' },
  { title: 'Architectural Design', slug: 'architectural-design', description: 'Modern, functional design solutions.' },
  { title: 'Project Management', slug: 'project-management', description: 'Comprehensive project planning and coordination.' }
];

const galleryData = [
  { title: 'Modern Villa', imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', category: 'Residential' },
  { title: 'Office Complex', imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', category: 'Commercial' },
  { title: 'Kitchen Remodel', imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', category: 'Renovation' }
];

(async function seed() {
  try {
    await connectDB(process.env.MONGO_URI);

    // Services
    await Service.deleteMany({});
    await Service.insertMany(servicesData);
    console.log('Services seeded:', servicesData.length);

    // Gallery
    await GalleryItem.deleteMany({});
    await GalleryItem.insertMany(galleryData);
    console.log('Gallery seeded:', galleryData.length);

    console.log('Seed finished');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
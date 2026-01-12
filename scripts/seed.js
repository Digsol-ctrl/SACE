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
  { title: 'Modern Villa', images: ['/images/construction_team.webp'], category: 'Residential' },
  { title: 'Office Complex', images: ['/images/construction_team.webp'], category: 'Commercial' },
  { title: 'Kitchen Remodel', images: ['/images/construction_team.webp'], category: 'Renovation' }
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
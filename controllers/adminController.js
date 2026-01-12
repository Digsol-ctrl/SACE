import { body, validationResult } from 'express-validator';
import Service from '../models/Service.js';
import GalleryItem from '../models/GalleryItem.js';
import Lead from '../models/Lead.js';
import fs from 'fs/promises';
import slugify from 'slugify';
import path from 'path';


const ITEMS_PER_PAGE = 50;

// Auth handlers
export function getLogin(req, res) {
  res.render('admin/login', { errors: [], title: 'SACE | Admin Login' });
}

export function postLogin(req, res) {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;
  if (username === adminUser && password === adminPass) {
    req.session.isAdmin = true;
    req.session.adminUser = username;
    return res.redirect('/admin');
  }
  return res.render('admin/login', { errors: ['Invalid credentials'], title: 'SACE | Admin Login' });
}


export function logout(req, res) {
  req.session.destroy(() => res.redirect('/admin/login'));
}

// Dashboard
export async function dashboard(req, res) {
  const [servicesCount, galleryCount, leadsCount] = await Promise.all([
    Service.countDocuments(),
    GalleryItem.countDocuments(),
    Lead.countDocuments()
  ]);
  res.render('admin/dashboard', { servicesCount, galleryCount, leadsCount,  title: 'SACE | Admin Dashboard' });
}

/* ----------------------
   Services
   ---------------------- */

export async function listServicesAdmin(req, res) {
  const services = await Service.find().sort({ createdAt: -1 }).lean();
  res.render('admin/services', { services, title: 'SACE | Services' });
}

export function newServiceForm(req, res) {
  res.render('admin/service-form', { service: {}, errors: [], title: "SACE : Add Service" });
}

export const createService = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  async (req, res) => {
    const errors = validationResult(req);
    const base = slugify(req.body.title, { lowe:true , strict: true})

    let slug = req.body.slug ? slugify(req.body.slug, { lower:true, strict: true }) : base

    let candidate = slug;

    let i = 1;
    while (await Service.findOne({ slug: candidate })) {
      candidate = `${slug}-${i++}`;
    }

    const serviceData = {
      title: req.body.title,
      slug: candidate,
      description: req.body.description || '',
      image: req.body.image || ''
    };
    if (!errors.isEmpty()) {
      return res.render('admin/service-form', { service: serviceData, errors: errors.array().map(e => e.msg), title: 'SACE | Services' });
    }
    // ensure unique slug
    const exists = await Service.findOne({ slug: serviceData.slug });
    if (exists) {
      return res.render('admin/service-form', { service: serviceData, errors: ['Slug already used'], title: 'SACE | Services' });
    }
    await Service.create(serviceData);
    res.redirect('/admin/services');
  }
];

export async function editServiceForm(req, res) {
  const service = await Service.findById(req.params.id).lean();
  if (!service) return res.redirect('/admin/services');
  res.render('admin/service-form', { service, errors: [], title: 'SACE | Edit Services' });
}

export const updateService = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  
  async (req, res) => {
    const errors = validationResult(req);
    const id = req.params.id;
    const update = {
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description || '',
      image: req.body.image || ''
    };
    if (!errors.isEmpty()) {
      update._id = id;
      return res.render('admin/service-form', { service: update, errors: errors.array().map(e => e.msg), title: 'SACE | Services' });
    }
    // check slug uniqueness excluding self
    const slugUsed = await Service.findOne({ slug: update.slug, _id: { $ne: id } });
    if (slugUsed) {
      update._id = id;
      return res.render('admin/service-form', { service: update, errors: ['Slug already used'], title: 'SACE | Services' });
    }
    await Service.findByIdAndUpdate(id, update);
    res.redirect('/admin/services');
  }
];

export async function deleteService(req, res) {
  await Service.findByIdAndDelete(req.params.id);
  res.redirect('/admin/services');
}

/* ----------------------
   Gallery
   ---------------------- */

export async function listGalleryAdmin(req, res) {
  const items = await GalleryItem.find().sort({ createdAt: -1 }).lean();
  res.render('admin/gallery', { items, title: 'Manage Projects'});
}

export function newGalleryForm(req, res) {
  res.render('admin/gallery-form', { item: {}, errors: [], title: 'New Project' });
}

export const createGallery = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  async (req, res) => {
    const errors = validationResult(req);
    const data = {
      title: req.body.title,
      category: req.body.category || 'Uncategorized',
      caption: req.body.caption || ''
    };

    // collect images from uploaded files and textarea (support up to 6 images)
    const images = [];
    if (req.files && req.files.length) images.push(...req.files.map(f => '/uploads/' + f.filename));
    if (req.body.imageUrls) {
      const lines = (typeof req.body.imageUrls === 'string' ? req.body.imageUrls.split(/[\r\n,]+/) : req.body.imageUrls);
      lines.forEach(u => { const s = (u || '').trim(); if (s) images.push(s); });
    }

    // dedupe and limit
    const finalImages = [...new Set(images)].slice(0, 6);
    if (finalImages.length === 0) return res.render('admin/gallery-form', { item: data, errors: ['At least one image is required'] });
    data.images = finalImages;

    // Other validation errors
    if (!errors.isEmpty()){
      return res.render('admin/gallery-form', { item: data, errors: errors.array().map(e => e.msg), title: 'New Project' })
    }

    await GalleryItem.create(data);
    res.redirect('/admin/gallery')
  }
];

export async function editGalleryForm(req, res) {
  const item = await GalleryItem.findById(req.params.id).lean();
  if (!item) return res.redirect('/admin/gallery');
  res.render('admin/gallery-form', { item, errors: [], title: 'Edit Projects' });
}

export const updateGallery = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  async (req, res) => {
    const errors = validationResult(req);
    const id = req.params.id;
    const item = await GalleryItem.findById(id);
    if (!item) return res.redirect('/admin/gallery');

    const update = {
      title: (req.body.title || '').trim(),
      category: req.body.category || 'Uncategorized',
      caption: req.body.caption || ''
    };

    // Build new images list if new files/URLs provided, otherwise keep existing
    const newImages = [];
    if (req.files && req.files.length) newImages.push(...req.files.map(f => '/uploads/' + f.filename));
    if (req.body.imageUrls) {
      const lines = (typeof req.body.imageUrls === 'string' ? req.body.imageUrls.split(/[\r\n,]+/) : req.body.imageUrls);
      lines.forEach(u => { const s = (u || '').trim(); if (s) newImages.push(s); });
    }
    const finalNewImages = [...new Set(newImages)].slice(0, 6);

    if (finalNewImages.length > 0) {
      // remove old uploaded files that are not in new list
      const oldUploaded = (item.images || []).filter(u => u && u.startsWith('/uploads/'));
      const toDelete = oldUploaded.filter(u => !finalNewImages.includes(u));
      for (const p of toDelete) {
        try { await fs.unlink(path.join(process.cwd(), 'public', p)); } catch (e) { /* ignore */ }
      }
      update.images = finalNewImages;
    } else {
      // keep existing
      update.images = item.images || [];
    }

    if (!errors.isEmpty()) {
      update._id = id;
      return res.render('admin/gallery-form', { item: update, errors: errors.array().map(e => e.msg), title: 'Edit Project' });
    }

    await GalleryItem.findByIdAndUpdate(id, update);
    res.redirect('/admin/gallery');
  }
];

export async function deleteGallery(req, res) {
  const item = await GalleryItem.findById(req.params.id);
  if (item && Array.isArray(item.images)) {
    for (const img of item.images) {
      if (img && img.startsWith('/uploads/')) {
        try { await fs.unlink(path.join(process.cwd(), 'public', img)); } catch (e) { /* ignore */ }
      }
    }
  }
  await GalleryItem.findByIdAndDelete(req.params.id);
  res.redirect('/admin/gallery');
}

/* ----------------------
   Leads
   ---------------------- */

export async function listLeadsAdmin(req, res) {
  const leads = await Lead.find().sort({ createdAt: -1 }).lean();
  res.render('admin/leads', { leads });
}

export async function deleteLead(req, res) {
  await Lead.findByIdAndDelete(req.params.id);
  res.redirect('/admin/leads');
}
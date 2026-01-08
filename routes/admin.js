import express from 'express';
import {
  getLogin,
  postLogin,
  logout,
  dashboard,
  listServicesAdmin,
  newServiceForm,
  createService,
  editServiceForm,
  updateService,
  deleteService,
  listGalleryAdmin,
  newGalleryForm,
  createGallery,
  editGalleryForm,
  updateGallery,
  deleteGallery,
  listLeadsAdmin,
  deleteLead
} from '../controllers/adminController.js';

import ensureAdmin from '../middleware/adminAuth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

//auth
router.get('/login', getLogin);
router.post('/login',postLogin)
router.get('/logout', logout);

//dashboard
router.get('/', ensureAdmin, dashboard);

// Services CRUD
router.get('/services', ensureAdmin, listServicesAdmin);
router.get('/services/new', ensureAdmin, newServiceForm);
router.post('/services', ensureAdmin, createService);
router.get('/services/:id/edit', ensureAdmin, editServiceForm);
router.post('/services/:id', ensureAdmin, updateService);
router.post('/services/:id/delete', ensureAdmin, deleteService);


// Gallery CRUD
router.get('/gallery', ensureAdmin, listGalleryAdmin);
router.get('/gallery/new', ensureAdmin, newGalleryForm);
router.post('/gallery', ensureAdmin, upload.single('image'), createGallery);
router.post('/gallery/:id', ensureAdmin, upload.single('image'), updateGallery);
router.get('/gallery/:id/edit', ensureAdmin, editGalleryForm);
router.post('/gallery/:id', ensureAdmin, upload.single('image'), updateGallery);
router.post('/gallery/:id/delete', ensureAdmin, deleteGallery);


// Leads
router.get('/leads', ensureAdmin, listLeadsAdmin);
router.post('/leads/:id/delete', ensureAdmin, deleteLead);

export default router;

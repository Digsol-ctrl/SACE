import express from 'express';
import { home } from '../controllers/homeController.js';
import { submitContact } from '../controllers/contactController.js';

const router = express.Router();

router.get('/', home);
router.post('/contact', submitContact);

export default router;

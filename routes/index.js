import express from 'express';
import { home } from '../controllers/homeController.js';
import { submitContact } from '../controllers/contactController.js';
import upload from '../middleware/upload.js';
import { projects } from '../controllers/projectsController.js';

const router = express.Router();

router.get('/', home);
router.post('/contact', submitContact);

// Temporary test route for file uploads (no auth) - remove when done
router.get('/test-upload', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Test upload</h1>
        <form method="post" action="/test-upload" enctype="multipart/form-data">
          <label>Choose image: <input type="file" name="image" accept="image/*" required></label><br>
          <label>Title: <input name="title" /></label><br>
          <label>Category: <input name="category" /></label><br>
          <label>Caption: <input name="caption" /></label><br>
          <button type="submit">Upload</button>
        </form>
      </body>
    </html>
  `);
});

router.post('/test-upload', upload.single('image'), (req, res) => {
  if (req.file) {
    return res.json({ ok: true, filename: req.file.filename, url: '/uploads/' + req.file.filename });
  }
  res.status(400).json({ ok: false, error: 'No file uploaded' });
});

// Projects page (dedicated gallery)
router.get('/projects', projects);

export default router;

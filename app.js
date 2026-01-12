import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import servicesRoutes from './routes/services.js';
import indexRoutes from './routes/index.js';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import adminRoutes from './routes/admin.js'

// Create app early so middlewares can be applied
const app = express();

// Security and performance middleware
app.use(helmet());
app.use(compression());

// Rate limiting for public endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
});
app.use(limiter);

// Session: use Mongo store in production
// Configure session store safely — fall back to in-memory store when MONGO_URI is not set
const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
};
if (process.env.MONGO_URI) {
  try {
    sessionOptions.store = MongoStore.create({ mongoUrl: process.env.MONGO_URI });
  } catch (err) {
    console.warn('Warning: failed to initialize MongoStore, falling back to default session store', err && err.message ? err.message : err);
  }
} else {
  console.warn('MONGO_URI not set — using in-memory session store (not for production)');
}
app.use(session(sessionOptions));

app.get('/health', (req, res) => res.status(200).json({ ok: true }));

app.use(express.static('public', { maxAge: '1d' })); // 1 day, adjust as needed

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// global template locals (whatsapp link + message)
app.use((req, res, next) => {
  const waNumber = process.env.WHATSAPP_NUMBER || '263784958161';
  const waMessage = process.env.WHATSAPP_MESSAGE || "Hello Simply Amazing Construction & Engineering! I found you on your website and I'm interested in your services.";
  res.locals.whatsappLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;
  next();
});

// Ensure admin flag is always defined for templates (false by default)
app.use((req, res, next) => {
  if (typeof res.locals.admin === 'undefined') res.locals.admin = !!(req.session && req.session.isAdmin);
  next();
});

// mark admin route so templates can render minimal nav
app.use((req, res, next) => {
  res.locals.isAdminRoute = typeof req.path === 'string' && req.path.startsWith('/admin');
  next();
});

// connect to DB before mounting routes that need it (skip if MONGO_URI not set)
if (process.env.MONGO_URI) {
  try {
    await connectDB(process.env.MONGO_URI);
  } catch (err) {
    console.error('Failed to connect to MongoDB; some features may be disabled.', err && err.message ? err.message : err);
  }
} else {
  console.warn('MONGO_URI not set — skipping DB connection (read-only mode)');
}

app.use('/services', servicesRoutes);
app.use('/', indexRoutes);

// register the admin routes
app.use('/admin', adminRoutes);

app.use((req, res, next) => {
  res.locals.title = res.locals.title || 'Simply Amaizing';
  next();
})

// 404 + error handlers (basic)
app.use((req, res) => res.status(404).render('404', { title: 'Not Found' }));
app.use((err, req, res, next) => {
  console.error(err);

  // Multer file size error
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    const maxMB = 5;
    const msg = `One or more files exceed the ${maxMB}MB size limit. Please upload smaller images or reduce resolution.`;
    if (req.path && req.path.startsWith('/admin/gallery')) {
      const item = {
        title: req.body ? (req.body.title || '') : '',
        category: req.body ? (req.body.category || 'Uncategorized') : 'Uncategorized',
        caption: req.body ? (req.body.caption || '') : ''
      };
      return res.status(400).render('admin/gallery-form', { item, errors: [msg] });
    }
    return res.status(400).send(msg);
  }

  // Too many files or unexpected field
  if (err && err.code === 'LIMIT_UNEXPECTED_FILE') {
    const msg = 'Too many files uploaded or unexpected file fields. Maximum 6 images are allowed.';
    if (req.path && req.path.startsWith('/admin/gallery')) {
      const item = {
        title: req.body ? (req.body.title || '') : '',
        category: req.body ? (req.body.category || 'Uncategorized') : 'Uncategorized',
        caption: req.body ? (req.body.caption || '') : ''
      };
      return res.status(400).render('admin/gallery-form', { item, errors: [msg] });
    }
    return res.status(400).send(msg);
  }

  res.status(500).send('Server error');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
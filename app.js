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
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
}));

app.get('/health', (req, res) => res.status(200).json({ ok: true }));

app.use(express.static('public', { maxAge: '1d' })); // 1 day, adjust as needed

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// global template locals (whatsapp link + message)
app.use((req, res, next) => {
  const waNumber = process.env.WHATSAPP_NUMBER || '226784958161';
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

// connect to DB before mounting routes that need it
await connectDB(process.env.MONGO_URI);

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
  res.status(500).send('Server error');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import servicesRoutes from './routes/services.js';
import indexRoutes from './routes/index.js';
import helmet from helmet;
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import MongoStore from 'connect-mongo';

app.use(helmet());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use(limiter);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStire.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV == 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 60, //1day
  }
}));

app.get('/health', (req, res) => res.status(200).json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('500', { title: 'Server error' });
})

app.use(express.static('public', { maxAge: '1d' })); // 1 day, adjust as needed

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// global template locals (whatsapp link + message)
app.use((req, res, next) => {
  const waNumber = process.env.WHATSAPP_NUMBER || '263784958161';
  const waMessage = process.env.WHATSAPP_MESSAGE || "Hello Simply Amazing Construction & Engineering! I found you on your website and I'm interested in your services.";
  res.locals.whatsappLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;
  next();
});

// connect to DB before mounting routes that need it
await connectDB(process.env.MONGO_URI);

app.use('/services', servicesRoutes);
app.use('/', indexRoutes);


// 404 + error handlers (basic)
app.use((req, res) => res.status(404).render('404', { title: 'Not Found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
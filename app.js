import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import servicesRoutes from './routes/services.js';
import indexRoutes from './routes/index.js';

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

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
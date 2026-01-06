import Service from '../models/Service.js';

export async function listServices(req, res, next) {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.render('services', { title: 'Services', services });
  } catch (err) {
    next(err);
  }
}
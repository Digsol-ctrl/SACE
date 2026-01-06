import Lead from '../models/Lead.js';

export async function submitContact(req, res, next) {
  try {
    const { name, email, phone, service, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const lead = await Lead.create({ name, email, phone, service, message });

    // Prepare WhatsApp url (use default number if env var not set)
    const whatsappNumber = process.env.WHATSAPP_NUMBER || '226784958161';
    const prefill = `Hi, I’m ${name}. I’m interested in ${service || 'your services'}. ${message}`;
    const waUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(prefill)}` : null;

    // Respond with JSON so client can show success and optionally redirect to WhatsApp
    res.json({ ok: true, lead, whatsapp: waUrl });
  } catch (err) {
    next(err);
  }
}

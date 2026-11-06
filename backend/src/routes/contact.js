import { Router } from 'express';
import { z } from 'zod';
import Contact from '../models/Contact.js';
import { sendContactMail } from '../lib/mailer.js';

const router = Router();
const schema = z.object({
  name: z.string().trim().min(2).max(100), phone: z.string().trim().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional().or(z.literal('')), message: z.string().trim().min(5).max(3000),
});
router.post('/', async (req, res, next) => {
  try {
    const data = schema.parse(req.body); const saved = await Contact.create(data);
    const result = await sendContactMail(data).catch((e) => ({ error: e }));
    if (result.error) { saved.emailStatus = 'failed'; await saved.save(); return res.status(502).json({ message: 'Enquiry saved, but email delivery failed. Please contact us by phone.' }); }
    res.status(201).json({ message: 'Your enquiry has been sent successfully.' });
  } catch (e) { next(e); }
});
export default router;

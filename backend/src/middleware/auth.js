import crypto from 'crypto';
import { config } from '../config.js';
import Booking from '../models/Booking.js';

const same = (a, b) => { const x = Buffer.from(String(a || '')); const y = Buffer.from(String(b || '')); return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y); };

export function requireAdmin(req, res, next) {
  if (!config.adminKey || !same(req.headers['x-admin-api-key'], config.adminKey)) return res.status(401).json({ message: 'Unauthorized' });
  next();
}

/** Customer access: bookingId + the secret token that is only in the customer's e-mail links. */
export async function loadBooking(req, res, next) {
  try {
    const token = req.headers['x-booking-token'] || req.query.t;
    const booking = await Booking.findOne({ bookingId: req.params.bookingId }).select('+accessToken');
    if (!booking || !same(booking.accessToken, token)) return res.status(404).json({ message: 'Booking not found or link is invalid.' });
    req.booking = booking; req.token = booking.accessToken;
    next();
  } catch (e) { next(e); }
}

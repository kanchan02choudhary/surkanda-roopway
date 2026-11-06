import 'dotenv/config';

const num = (v, d) => (v === undefined || v === '' || Number.isNaN(Number(v)) ? d : Number(v));

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: num(process.env.PORT, 5000),
  mongoUri: process.env.MONGODB_URI,
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim().replace(/\/$/, ''),
  corsOrigins: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((s) => s.trim().replace(/\/$/, '')),
  adminKey: process.env.ADMIN_API_KEY,

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  resendKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM,
  contactTo: process.env.CONTACT_TO,
  staffEmail: process.env.STAFF_NOTIFY_EMAIL || process.env.CONTACT_TO,

  pricing: {
    pricePaise: num(process.env.TICKET_PRICE_PAISE, 22500), // per ticket, GST inclusive
    gstPercent: num(process.env.GST_PERCENT, 5),
    maxQty: num(process.env.MAX_TICKETS_PER_BOOKING, 9),
    maxAdvanceDays: num(process.env.BOOKING_MAX_ADVANCE_DAYS, 90),
    itemName: process.env.TICKET_ITEM_NAME || 'Adult 2 way',
  },

  cancellation: {
    cutoffHours: num(process.env.CANCELLATION_CUTOFF_HOURS, 24), // paid tickets: cancel allowed until N hours before visit day 00:00 IST
    refundPercent: num(process.env.REFUND_PERCENT, 100),
  },

  // Printed on the ticket (copy of the counter bill). Verify against the original bill / GST registration.
  company: {
    name: process.env.COMPANY_NAME || 'Surkanda Devi Ropeway Project Co. P. Ltd.',
    addressLine1: process.env.COMPANY_ADDRESS_1 || 'Kaddukhal, Danaulti Tehri Garhwal,',
    addressLine2: process.env.COMPANY_ADDRESS_2 || 'Uttarakhand - 249145',
    cin: process.env.COMPANY_CIN || 'U45200UR2013PTC000530',
    gstin: process.env.COMPANY_GSTIN || '05AASCS5830P1ZL',
    contact: process.env.COMPANY_CONTACT || '+91 7060706045',
    hsn: process.env.TICKET_HSN || '',
  },
  onlineCounterCode: String(process.env.ONLINE_COUNTER_CODE || '99').padStart(2, '0').slice(-2),
  docRetentionDays: num(process.env.DOC_RETENTION_DAYS, 30),
};

export function assertProductionConfig() {
  const required = ['MONGODB_URI', 'FRONTEND_URL', 'ADMIN_API_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RESEND_API_KEY', 'EMAIL_FROM'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  if (config.adminKey && config.adminKey.length < 24) throw new Error('ADMIN_API_KEY must be at least 24 characters.');
  if (!config.razorpay.webhookSecret) console.warn('[warn] RAZORPAY_WEBHOOK_SECRET not set — webhook (backup confirmation + refund status) is disabled.');
}

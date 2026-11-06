import { Resend } from 'resend';
import { config } from '../config.js';
import Booking from '../models/Booking.js';
import { buildTicket, ticketHtml, ticketPdf } from './ticket.js';
import { displayDate } from './time.js';
import { rupees } from './pricing.js';

let client;
const resend = () => (client ||= new Resend(config.resendKey));
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const manageLink = (b, token) => `${config.frontendUrl}/booking/${b.bookingId}?t=${token}`;

const shell = (title, body) => `<!doctype html><html><body style="margin:0;background:#f4f1e6;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#14262a">
<div style="max-width:620px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e3dfcc">
<div style="background:#0c3a3a;color:#fff;padding:20px 28px"><div style="font-size:12px;letter-spacing:2px;color:#fcc534">SURKANDA DEVI ROPEWAY</div><div style="font-size:20px;margin-top:4px">${esc(title)}</div></div>
<div style="padding:26px 28px;font-size:15px;line-height:1.6">${body}</div>
<div style="padding:16px 28px;background:#faf7ec;font-size:12px;color:#566669">${esc(config.company.name)} · ${esc(config.company.addressLine1)} ${esc(config.company.addressLine2)} · ${esc(config.company.contact)}</div>
</div></body></html>`;
const btn = (href, label) => `<p style="margin:22px 0"><a href="${href}" style="background:#e0a21c;color:#031c21;text-decoration:none;font-weight:bold;padding:13px 26px;border-radius:999px;display:inline-block">${esc(label)}</a></p>`;
const details = (b) => `<table style="border-collapse:collapse;font-size:14px;margin:14px 0"><tr><td style="padding:3px 16px 3px 0;color:#566669">Booking ID</td><td><b>${b.bookingId}</b></td></tr>
<tr><td style="padding:3px 16px 3px 0;color:#566669">Guest</td><td>${esc(b.name)}</td></tr>
<tr><td style="padding:3px 16px 3px 0;color:#566669">Visit date</td><td>${displayDate(b.visitDate)}</td></tr>
<tr><td style="padding:3px 16px 3px 0;color:#566669">Tickets</td><td>${b.quantity} × ${esc(config.pricing.itemName)}</td></tr>
<tr><td style="padding:3px 16px 3px 0;color:#566669">Amount</td><td>₹${rupees(b.amount)}</td></tr></table>`;

/** Sends + logs the outcome on the booking (so staff can see what was delivered). Never throws. */
async function deliver(booking, type, { to, subject, html, attachments, replyTo }) {
  const entry = { type, to: Array.isArray(to) ? to.join(',') : to, status: 'sent', at: new Date() };
  try {
    if (!config.resendKey || !config.emailFrom) { entry.status = 'skipped'; entry.error = 'Resend not configured'; }
    else {
      const { data, error } = await resend().emails.send({ from: config.emailFrom, to: Array.isArray(to) ? to : [to], subject, html, attachments, replyTo });
      if (error) { entry.status = 'failed'; entry.error = error.message || String(error); } else entry.resendId = data?.id;
    }
  } catch (e) { entry.status = 'failed'; entry.error = e.message; }
  if (entry.status !== 'sent') console.error(`[mail:${type}] ${entry.status}: ${entry.error}`);
  if (booking?._id) await Booking.updateOne({ _id: booking._id }, { $push: { emails: entry } }).catch(() => {});
  return entry;
}

const staff = () => config.staffEmail;

export const mails = {
  async bookingReceived(b, token) {
    const r = await deliver(b, 'booking_received', {
      to: b.email, subject: `Booking request received – ${b.bookingId}`,
      html: shell('Booking request received', `<p>Dear ${esc(b.name)},</p><p>We have received your ropeway booking request and ID document. Our team is verifying your document. <b>You will get another email as soon as it is verified</b> — payment is only needed after that.</p>${details(b)}${btn(manageLink(b, token), 'Track / manage booking')}<p style="font-size:13px;color:#566669">Keep this email — the link above is private to you. You can cancel the request from the same page.</p>`),
    });
    if (staff()) await deliver(b, 'staff_new_booking', { to: staff(), subject: `[Action] New booking to verify – ${b.bookingId}`, html: shell('New booking to verify', `<p>${esc(b.name)} (${esc(b.phone)}) submitted an ID document.</p>${details(b)}${btn(`${config.frontendUrl}/admin`, 'Open admin panel')}`) });
    return r;
  },
  documentApproved: (b, token) => deliver(b, 'document_approved', {
    to: b.email, subject: `Document verified – complete payment for ${b.bookingId}`,
    html: shell('Document verified ✔', `<p>Dear ${esc(b.name)},</p><p>Your ID document has been verified. You can now pay securely and get your e-ticket.</p>${details(b)}${btn(manageLink(b, token), `Pay ₹${rupees(b.amount)} now`)}<p style="font-size:13px;color:#566669">Your e-ticket will be emailed immediately after successful payment.</p>`),
  }),
  documentRejected: (b, token, note) => deliver(b, 'document_rejected', {
    to: b.email, subject: `Action needed: ID document not accepted – ${b.bookingId}`,
    html: shell('Document not accepted', `<p>Dear ${esc(b.name)},</p><p>We could not verify the document you uploaded.</p>${note ? `<p style="background:#fff6d9;border-left:4px solid #e0a21c;padding:10px 14px"><b>Reason:</b> ${esc(note)}</p>` : ''}<p>Please upload a clear, valid photo ID (PDF/JPG/PNG, max 5 MB) from your booking page.</p>${details(b)}${btn(manageLink(b, token), 'Upload a new document')}`),
  }),
  async ticket(b, token) {
    const t = await buildTicket(b);
    const pdf = await ticketPdf(t);
    return deliver(b, 'ticket', {
      to: b.email, subject: `Your e-ticket – Bill ${t.billNo} (visit ${displayDate(b.visitDate)})`,
      attachments: [{ filename: `Surkanda-Ropeway-Ticket-${t.billNo}.pdf`, content: pdf }],
      html: shell('Payment received – your e-ticket', `<p>Dear ${esc(b.name)},</p><p>Payment of <b>₹${rupees(b.amount)}</b> is confirmed. Your e-ticket is below and attached as a PDF.</p>${ticketHtml(t)}<p><b>Please carry the same original photo ID</b> and show this ticket (QR in the PDF) at the counter on <b>${displayDate(b.visitDate)}</b>.</p>${btn(manageLink(b, token), 'View ticket / cancel booking')}`),
    });
  },
  cancelled: (b, token) => {
    const c = b.cancellation || {};
    const refund = c.refundAmount > 0
      ? `<p>A refund of <b>₹${rupees(c.refundAmount)}</b> (${c.refundPercent}%) has been ${c.refundStatus === 'failed' ? 'queued — our team will process it manually and update you' : 'initiated to your original payment method. It usually reflects in 5–7 working days'}.</p>`
      : (b.payment?.paymentId ? '<p>No refund is applicable for this cancellation as per the refund policy.</p>' : '<p>No payment was taken, so nothing will be charged.</p>');
    return deliver(b, 'cancelled', {
      to: b.email, subject: `Booking cancelled – ${b.bookingId}`,
      html: shell('Booking cancelled', `<p>Dear ${esc(b.name)},</p><p>Your booking has been cancelled${c.by === 'admin' ? ' by the ropeway team' : ''}.${c.reason ? ` Reason: ${esc(c.reason)}.` : ''}</p>${refund}${details(b)}<p style="font-size:13px;color:#566669">You can book again anytime from our website.</p>`),
    });
  },
  refundProcessed: (b) => deliver(b, 'refund_processed', {
    to: b.email, subject: `Refund processed – ${b.bookingId}`,
    html: shell('Refund processed', `<p>Dear ${esc(b.name)},</p><p>Your refund of <b>₹${rupees(b.cancellation.refundAmount)}</b> for booking <b>${b.bookingId}</b> has been processed. Your bank may take a few more working days to show it.</p>${b.cancellation.refundId ? `<p style="font-size:13px;color:#566669">Refund reference: ${esc(b.cancellation.refundId)}</p>` : ''}`),
  }),
  resendLink: (b, token) => deliver(b, 'booking_link', {
    to: b.email, subject: `Your booking link – ${b.bookingId}`,
    html: shell('Your booking link', `<p>Dear ${esc(b.name)},</p><p>Use the button below to see the status of your booking, pay (once verified), download your ticket, or cancel.</p>${details(b)}${btn(manageLink(b, token), 'Open my booking')}<p style="font-size:13px;color:#566669">If you did not ask for this email you can ignore it.</p>`),
  }),
  staffAlert: (b, subject, text) => staff() && deliver(b, 'staff_alert', { to: staff(), subject: `[Alert] ${subject} – ${b.bookingId}`, html: shell(subject, `<p>${esc(text)}</p>${details(b)}`) }),
};

export async function sendContactMail({ name, phone, email, message }) {
  if (!config.resendKey || !config.emailFrom || !config.contactTo) return { error: { message: 'Resend not configured' } };
  return resend().emails.send({ from: config.emailFrom, to: [config.contactTo], replyTo: email || undefined, subject: `Website enquiry from ${name}`, text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email || 'Not provided'}\n\nMessage:\n${message}` });
}

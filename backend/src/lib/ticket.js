import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { config } from '../config.js';
import { computeBreakdown, rupees } from './pricing.js';
import { billDateTime, displayDate } from './time.js';

const W = 40; // characters per line (80 mm thermal-style bill)
const pad = (s, n) => String(s).padEnd(n).slice(0, n);
const lpad = (s, n) => String(s).padStart(n);
const row = (l, r) => `${l}${lpad(r, Math.max(1, W - String(l).length))}`;
const line = (text, o = {}) => ({ text, bold: false, center: false, big: false, ...o });
const dash = () => line('-'.repeat(W));

/** Pure function: ticket data -> receipt lines. Same layout as the counter bill. */
export function receiptLines(t) {
  const c = config.company; const b = t.breakdown;
  const L = [];
  const i = c.name.indexOf(' Project');
  const nameParts = i > 0 ? [c.name.slice(0, i), c.name.slice(i + 1)] : [c.name];
  nameParts.forEach((n) => L.push(line(n, { center: true, bold: true, big: true })));
  L.push(line(c.addressLine1, { center: true }), line(c.addressLine2, { center: true }));
  L.push(line(`CIN: ${c.cin}`, { center: true }), line(`GSTIN: ${c.gstin}`, { center: true }));
  L.push(line(`Contact: ${c.contact}`, { center: true }));
  L.push(line('Ticket Counter: Online (Website)', { center: true }));
  L.push(line(row('', 'User: Website')));
  L.push(dash());
  L.push(line(`Ctg    : Online (Razorpay)`));
  L.push(line(`Date   : ${t.billDate}`));
  L.push(line(`Bill No.: ${t.billNo}`, { bold: true }));
  L.push(line(`Booking: ${t.bookingId}`));
  L.push(line(`Guest  : ${t.guest}`));
  L.push(line(`Visit Date: ${displayDate(t.visitDate)}`, { bold: true }));
  L.push(dash());
  L.push(line(`${pad('Sl', 2)} ${pad(`Item${c.hsn ? '/HSN' : ''}`, 12)}${lpad('Qty', 3)}${lpad('Rate', 8)}${lpad('GST%', 5)}${lpad('Amount', 9)}`));
  L.push(dash());
  const name = c.hsn ? `${config.pricing.itemName}` : config.pricing.itemName;
  L.push(line(`${pad('1', 2)} ${pad(name, 12)}${lpad(b.quantity, 3)}${lpad(rupees(b.ratePaise), 8)}${lpad(`${b.gstPercent}%`, 5)}${lpad(rupees(b.taxable), 9)}`));
  if (c.hsn) L.push(line(`   HSN: ${c.hsn}`));
  L.push(dash());
  L.push(line(row('Amount =', rupees(b.taxable))));
  L.push(line(row(`SGST =`, rupees(b.sgst))));
  L.push(line(row(`CGST =`, rupees(b.cgst))));
  L.push(dash());
  L.push(line(row('Round Off =', (b.roundOff < 0 ? '-' : '') + rupees(Math.abs(b.roundOff)))));
  L.push(line(row('Bill Total : Rs.', rupees(b.total)), { bold: true }));
  L.push(dash());
  L.push(line(row('Amount Received By Guest: Rs.', rupees(b.total))));
  L.push(line(row('Balance Amount Return: Rs.', '0.00')));
  return L;
}

export async function buildTicket(booking) {
  const b = computeBreakdown(booking.quantity);
  if (b.total !== booking.amount) b.total = booking.amount; // trust what was actually charged
  const issued = booking.ticket?.issuedAt || booking.payment?.paidAt || new Date();
  const t = {
    bookingId: booking.bookingId,
    billNo: booking.ticket?.billNo,
    billDate: billDateTime(new Date(issued)),
    issuedAt: new Date(issued).toISOString(),
    visitDate: booking.visitDate,
    guest: booking.name,
    quantity: booking.quantity,
    paymentId: booking.payment?.paymentId,
    breakdown: b,
  };
  t.lines = receiptLines(t);
  t.qrPayload = `SDRP|${t.billNo}|${t.bookingId}|${t.visitDate}|${t.quantity}`;
  t.qrDataUrl = await QRCode.toDataURL(t.qrPayload, { margin: 1, width: 220, errorCorrectionLevel: 'M' });
  return t;
}

const NOTES = [
  'Valid only for the visit date above.',
  'Carry the same original photo ID.',
  'Show this ticket (QR) at the counter.',
];

export async function ticketPdf(ticket) {
  const pageW = 226.77; const m = 14; const normal = 10.6; const big = 14;
  const qr = 96;
  const bodyH = ticket.lines.reduce((s, l) => s + (l.big ? big : normal), 0);
  const height = Math.ceil(m + bodyH + 14 + qr + 12 + NOTES.length * normal + 20 + m);
  const doc = new PDFDocument({ size: [pageW, height], margin: 0, info: { Title: `E-Ticket ${ticket.billNo}`, Author: config.company.name } });
  const chunks = []; doc.on('data', (d) => chunks.push(d));
  const done = new Promise((res) => doc.on('end', () => res(Buffer.concat(chunks))));
  let y = m;
  for (const l of ticket.lines) {
    doc.font(l.bold ? 'Courier-Bold' : 'Courier').fontSize(l.big ? 10.5 : 7.9).fillColor('#000');
    doc.text(l.text, m, y, { width: pageW - m * 2, align: l.center ? 'center' : 'left', lineBreak: false });
    y += l.big ? big : normal;
  }
  y += 10;
  doc.image(Buffer.from(ticket.qrDataUrl.split(',')[1], 'base64'), (pageW - qr) / 2, y, { width: qr, height: qr });
  y += qr + 10;
  doc.font('Courier').fontSize(7.2);
  for (const n of NOTES) { doc.text(n, m, y, { width: pageW - m * 2, align: 'center', lineBreak: false }); y += normal; }
  y += 6;
  doc.font('Courier-Bold').fontSize(7.2).text('*** E-TICKET ***', m, y, { width: pageW - m * 2, align: 'center', lineBreak: false });
  doc.end();
  return done;
}

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Receipt as e-mail-safe HTML (monospace box). */
export function ticketHtml(ticket) {
  const rows = ticket.lines.map((l) => `<div style="white-space:pre;${l.center ? 'text-align:center;' : ''}${l.bold ? 'font-weight:bold;' : ''}${l.big ? 'font-size:14px;' : ''}">${esc(l.text) || '&nbsp;'}</div>`).join('');
  return `<div style="background:#fff;border:1px dashed #999;padding:16px 12px;max-width:380px;margin:16px auto;font-family:'Courier New',Courier,monospace;font-size:12px;line-height:1.45;color:#000;overflow-x:auto">${rows}</div>`;
}

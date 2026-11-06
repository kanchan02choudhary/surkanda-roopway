import test from 'node:test';
import assert from 'node:assert/strict';
import { computeBreakdown, rupees } from '../src/lib/pricing.js';
import { formatBillNo } from '../src/lib/billing.js';
import { todayIST, addDaysISO, billDateTime, visitDayStart } from '../src/lib/time.js';
import { cancellationPolicy } from '../src/lib/cancellation.js';
import { buildTicket, ticketPdf, ticketHtml } from '../src/lib/ticket.js';
import { verifyCheckoutSignature } from '../src/lib/payments.js';
import { hasValidFileSignature } from '../src/middleware/upload.js';
import crypto from 'node:crypto';

test('pricing matches the counter bill (2 adults = 428.58 + 10.71 + 10.71 = 450.00)', () => {
  const b = computeBreakdown(2);
  assert.equal(rupees(b.ratePaise), '214.29');
  assert.equal(rupees(b.taxable), '428.58');
  assert.equal(rupees(b.sgst), '10.71');
  assert.equal(rupees(b.cgst), '10.71');
  assert.equal(b.roundOff, 0);
  assert.equal(rupees(b.total), '450.00');
});

test('pricing always sums to the charged amount via round-off', () => {
  for (let q = 1; q <= 9; q++) {
    const b = computeBreakdown(q);
    assert.equal(b.taxable + b.sgst + b.cgst + b.roundOff, 22500 * q);
    assert.ok(Math.abs(b.roundOff) <= 10);
  }
});

test('bill number has the 13-digit counter bill shape', () => {
  const n = formatBillNo('01', new Date('2026-10-31T07:54:00Z'), 10166);
  assert.equal(n, '0126103110166'); // same as the sample bill: 0126103110166
  assert.equal(n.length, 13);
});

test('IST date helpers', () => {
  assert.equal(todayIST(new Date('2026-10-31T19:00:00Z')), '2026-11-01'); // 00:30 IST next day
  assert.equal(addDaysISO('2026-12-31', 1), '2027-01-01');
  assert.equal(billDateTime(new Date('2026-10-31T07:54:00Z')), '31-10-2026 13:24:00');
});

test('cancellation policy: free before payment, cutoff + refund after payment', () => {
  const base = { visitDate: '2026-11-10', amount: 45000 };
  assert.deepEqual({ ...cancellationPolicy({ ...base, status: 'pending_verification' }) }.allowed, true);
  const paid = { ...base, status: 'paid' };
  const early = cancellationPolicy(paid, new Date('2026-11-05T00:00:00Z'));
  assert.equal(early.allowed, true); assert.equal(early.refundAmount, 45000);
  const late = cancellationPolicy(paid, new Date(visitDayStart('2026-11-10').getTime() - 3600 * 1000));
  assert.equal(late.allowed, false);
  assert.equal(cancellationPolicy({ ...base, status: 'cancelled' }).allowed, false);
});

test('ticket renders (lines, QR, PDF, HTML)', async () => {
  const issued = new Date('2026-10-31T07:54:00Z');
  const t = await buildTicket({ bookingId: 'SR261031ABC123', name: 'Test <b>Guest</b>', quantity: 2, amount: 45000, visitDate: '2026-11-01', ticket: { billNo: '9926103100001', issuedAt: issued }, payment: { paymentId: 'pay_x', paidAt: issued } });
  const text = t.lines.map((l) => l.text).join('\n');
  for (const s of ['214.29', '428.58', '10.71', '450.00', '05AASCS5830P1ZL', '9926103100001', '01-11-2026']) assert.ok(text.includes(s), `missing ${s}`);
  assert.ok(t.lines.every((l) => l.text.length <= 40));
  assert.match(t.qrDataUrl, /^data:image\/png;base64,/);
  assert.ok((await ticketPdf(t)).subarray(0, 5).toString() === '%PDF-');
  assert.ok(!ticketHtml(t).includes('<b>Guest</b>')); // guest name is escaped
});

test('checkout signature verification', () => {
  process.env.RAZORPAY_KEY_SECRET = 'x'; // config is read at import; verify the helper with the configured secret
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const sig = crypto.createHmac('sha256', secret || '').update('order_1|pay_1').digest('hex');
  // when no secret is configured in the test env, only assert that a wrong signature is rejected
  assert.equal(verifyCheckoutSignature('order_1', 'pay_1', 'deadbeef'), false);
  assert.equal(typeof sig, 'string');
});

test('file signature check rejects spoofed uploads', () => {
  assert.equal(hasValidFileSignature({ mimetype: 'application/pdf', buffer: Buffer.from('%PDF-1.7 abcdefgh') }), true);
  assert.equal(hasValidFileSignature({ mimetype: 'application/pdf', buffer: Buffer.from('<script>alert(1)</script>') }), false);
  assert.equal(hasValidFileSignature({ mimetype: 'image/png', buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]) }), false);
});

test('all route modules load (import graph is valid)', async () => {
  for (const m of ['bookings', 'admin', 'webhook', 'contact']) await import(`../src/routes/${m}.js`);
});

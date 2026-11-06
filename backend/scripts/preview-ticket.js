// Generates a sample ticket PDF so you can check the layout: npm run preview-ticket
import fs from 'fs';
import { buildTicket, ticketPdf } from '../src/lib/ticket.js';
import { formatBillNo } from '../src/lib/billing.js';

const issued = new Date();
const booking = {
  bookingId: 'SR1761898440123AB12', name: 'Sample Guest', quantity: Number(process.argv[2] || 2), amount: 22500 * Number(process.argv[2] || 2),
  visitDate: '2026-11-01', ticket: { billNo: formatBillNo('99', issued, 1), issuedAt: issued }, payment: { paymentId: 'pay_TEST123', paidAt: issued },
};
const t = await buildTicket(booking);
fs.writeFileSync('sample-ticket.pdf', await ticketPdf(t));
console.log(t.lines.map((l) => l.text).join('\n'));
console.log('\nWritten: sample-ticket.pdf');

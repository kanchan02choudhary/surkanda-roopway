import { config } from '../config.js';

const r2 = (n) => Math.round(n); // integer paise helper (explicit for readability)

/**
 * Counter-bill style breakdown, all values in paise.
 * Receipt example: 2 tickets -> rate 214.29, amount 428.58, SGST 10.71, CGST 10.71, total 450.00.
 * Rate = inclusive price / (1 + GST). Tax is 2.5% + 2.5% on the taxable amount; any paise difference goes to round-off.
 */
export function computeBreakdown(quantity, opts = {}) {
  const pricePaise = opts.pricePaise ?? config.pricing.pricePaise;
  const gst = opts.gstPercent ?? config.pricing.gstPercent;
  const ratePaise = r2(pricePaise / (1 + gst / 100));
  const taxable = ratePaise * quantity;
  const sgst = r2((taxable * gst) / 200);
  const cgst = sgst;
  const payable = pricePaise * quantity;
  const roundOff = payable - (taxable + sgst + cgst);
  return { quantity, ratePaise, taxable, sgst, cgst, roundOff, total: payable, gstPercent: gst };
}

export const rupees = (paise) => (paise / 100).toFixed(2);

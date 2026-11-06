import Counter from '../models/Counter.js';
import { config } from '../config.js';
import { istParts } from './time.js';

/**
 * Bill number, same shape as the counter bill (13 digits):
 *   counter(2) + yymmdd(6) + running number of the day(5)   e.g. 01 261031 10166
 * Online bookings use ONLINE_COUNTER_CODE so they never collide with counter sequences.
 */
export function formatBillNo(counterCode, date, seq) {
  const p = istParts(date);
  return `${counterCode}${String(p.y).slice(-2)}${p.m}${p.d}${String(seq).padStart(5, '0')}`;
}

export async function nextBillNo(date = new Date()) {
  const p = istParts(date);
  const key = `bill-${config.onlineCounterCode}-${p.y}${p.m}${p.d}`;
  const doc = await Counter.findOneAndUpdate({ _id: key }, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return { billNo: formatBillNo(config.onlineCounterCode, date, doc.seq), seq: doc.seq };
}

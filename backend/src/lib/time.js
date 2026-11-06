// All business dates are Indian Standard Time (UTC+05:30, no DST).
const IST_OFFSET_MIN = 330;

export function istParts(d = new Date()) {
  const t = new Date(d.getTime() + IST_OFFSET_MIN * 60000);
  const p = (n, l = 2) => String(n).padStart(l, '0');
  return {
    y: t.getUTCFullYear(), m: p(t.getUTCMonth() + 1), d: p(t.getUTCDate()),
    hh: p(t.getUTCHours()), mm: p(t.getUTCMinutes()), ss: p(t.getUTCSeconds()),
  };
}
export const todayIST = (d = new Date()) => { const x = istParts(d); return `${x.y}-${x.m}-${x.d}`; };
export const addDaysISO = (iso, days) => {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
};
// 31-10-2026 13:24:00 (format used on the counter bill)
export const billDateTime = (d = new Date()) => { const x = istParts(d); return `${x.d}-${x.m}-${x.y} ${x.hh}:${x.mm}:${x.ss}`; };
export const displayDate = (iso) => { const [y, m, d] = iso.split('-'); return `${d}-${m}-${y}`; };
// Start of the visit day (00:00 IST) as a UTC Date
export const visitDayStart = (iso) => new Date(`${iso}T00:00:00+05:30`);

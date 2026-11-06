import multer from 'multer';

const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_, file, cb) => (allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only PDF, JPG and PNG documents are accepted.'))),
});

/** Checks the real file bytes (magic numbers), not just the browser-supplied MIME type. */
export function hasValidFileSignature(file) {
  const h = file.buffer;
  if (!h || h.length < 8) return false;
  if (file.mimetype === 'application/pdf') return h.subarray(0, 5).toString() === '%PDF-';
  if (file.mimetype === 'image/jpeg') return h[0] === 0xff && h[1] === 0xd8 && h[2] === 0xff;
  if (file.mimetype === 'image/png') return h.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return false;
}

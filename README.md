# Surkanda Devi Ropeway — Online Ticket Booking (MERN)

`frontend/` React + Vite · `backend/` Express + MongoDB · Razorpay payments · Resend e-mails

## Booking flow
1. **Customer submits** name, phone, email, visit date, tickets + photo ID → status `pending_verification`. *No payment yet.*
   Emails: "request received" (customer) + "new booking to verify" (staff).
2. **Staff verifies** the ID in `/admin` (Approve / Reject).
   - Approve → status `verified` → email with **Pay now** link.
   - Reject → status `document_rejected` → email with reason; customer re-uploads from the booking page.
3. **Razorpay payment** is possible only for `verified` bookings. The amount is always computed on the server. After payment the server verifies the signature **and** re-fetches the payment from Razorpay (must be `captured` and the exact amount).
4. **E-ticket**: bill number issued, ticket emailed (HTML in the counter-bill format + PDF with QR), also shown/downloadable on the booking page.
5. **Cancel**: free before payment. After payment, allowed until `CANCELLATION_CUTOFF_HOURS` before the visit day; refund of `REFUND_PERCENT` goes to the original payment method via Razorpay. Staff can cancel any booking (e.g. weather closure) with a full refund. Customer gets an email at each step, including "refund processed".

Customers reach their booking with a private link (`/booking/<id>?t=<secret>`) sent by email; a "resend link" form is on the booking page.

## Ticket format
Copied from the counter bill: company header, CIN, GSTIN, contact, Ctg, Date, Bill No., item table (Rate / GST% / Amount), Amount, SGST, CGST, Round Off, Bill Total, Amount Received, Balance. Bill number = `counter(2) + yymmdd(6) + running no.(5)` (online tickets use counter `ONLINE_COUNTER_CODE`, default `99`). Header values come from env (`COMPANY_*`) — **verify CIN/GSTIN/address against the original bill**.
Preview: `cd backend && npm run preview-ticket` → `sample-ticket.pdf`.

## Local setup
```bash
# backend
cd backend && npm install && cp .env.example .env   # fill MongoDB, Razorpay, Resend and admin secrets
npm run dev          # http://localhost:5000/api/health
npm test             # unit tests (pricing, bill no, policy, ticket, file checks)

# frontend (second terminal)
cd frontend && npm install && cp .env.example .env
npm run dev          # http://localhost:5173
```
Staff panel: `http://localhost:5173/admin` (enter `ADMIN_API_KEY`).

## Deploy
**Backend (Render / Railway / any Node host)** — `render.yaml` included (root dir `backend`, start `npm start`, health `/api/health`).
Set all variables from `backend/.env.example` (`NODE_ENV=production`). Use MongoDB Atlas for `MONGODB_URI` (allow the host's IPs in Atlas Network Access).
ID documents are stored in MongoDB (not on disk), so ephemeral hosts are fine.

**Frontend ↔ backend connection** — the React app calls the Express API through `frontend/src/lib/api.js`. Set `VITE_API_URL=https://<your-backend-domain>/api` in the frontend hosting environment (Vercel Project → Settings → Environment Variables), then redeploy. In the backend hosting environment set `FRONTEND_URL=https://<your-frontend-domain>` (comma-separated if you use both www and non-www), then redeploy the backend. Do not put Razorpay secret, MongoDB URI, admin key, Resend key or webhook secret in any `VITE_` variable. For local development, `frontend/.env.example` points to `http://localhost:5000/api`.

**Frontend** — set `VITE_API_URL=https://<your-backend>/api`, then `npm run build`:
- Vercel: `vercel.json` included · Netlify: `public/_redirects` included · cPanel/Apache: upload `dist/` (`.htaccess` included).
- Put the final frontend URL in the backend `FRONTEND_URL` (CORS + email links). Several origins: comma separated.

**Razorpay**
1. Ticket price is set to **₹225 per adult two-way ticket, inclusive of GST** (`TICKET_PRICE_PAISE=22500`, `GST_PERCENT=5`). Two tickets therefore total ₹450, matching the supplied counter bill. The server calculates the amount; the browser cannot choose it.
2. Test keys first. Make sure payment capture is **automatic** (only `captured` payments are accepted).
3. Dashboard → Webhooks → URL `https://<backend>/api/webhooks/razorpay`, secret = `RAZORPAY_WEBHOOK_SECRET`, events: `payment.captured`, `refund.processed`, `refund.failed`. This guarantees the ticket is issued even if the customer closes the browser right after paying, and sends the "refund processed" email.

**Resend** — verify your sending domain (SPF/DKIM) and use an address on it in `EMAIL_FROM`; until then Resend delivers only to your own account email.

## API
Customer (token via `x-booking-token` header or `?t=`): `GET /api/bookings/config` · `POST /api/bookings` (multipart) · `GET /api/bookings/:id` · `PUT /:id/document` · `POST /:id/pay` · `POST /:id/verify-payment` · `POST /:id/cancel` · `GET /:id/ticket.pdf` · `POST /resend-link`
Admin (`x-admin-api-key`): `GET /api/admin/bookings?status=&q=` · `GET /:id/document` · `PATCH /:id/document {status,note}` · `POST /:id/cancel {reason,refundPercent?}` · `POST /:id/retry-refund`
Webhook: `POST /api/webhooks/razorpay`

## Please confirm before go-live
- **Cancellation/refund rules** (`CANCELLATION_CUTOFF_HOURS=24`, `REFUND_PERCENT=100`) are placeholders I chose — set what management approves. The Refund page reads these values automatically.
- CIN / GSTIN / address / contact and item name (`Adult 2 way`) were read from a photo of the bill; HSN code is not visible on it (`TICKET_HSN` optional).
- Document check is a **manual human review**, not automatic identity verification; staff should still match the original ID at the counter.
- ID proofs are sensitive personal data: use HTTPS, keep `ADMIN_API_KEY` secret, and update the Privacy Policy wording. Documents are auto-deleted `DOC_RETENTION_DAYS` (30) after the visit date (7 days after cancellation).
- Test the whole flow in Razorpay **test mode** (book → approve → pay → ticket email → cancel → refund) before live keys.


## Security note
Local `.env` files are intentionally not included in this source ZIP because they can contain live credentials. Copy each `.env.example` to `.env` locally and enter your own values. If the earlier ZIP or its `.env` was ever committed to GitHub or shared publicly, rotate the Razorpay, MongoDB, Resend and admin credentials before going live.

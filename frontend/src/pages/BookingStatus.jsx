import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { FiCheckCircle, FiClock, FiAlertTriangle, FiDownload, FiXCircle, FiCreditCard, FiUpload } from 'react-icons/fi'
import { PageHero } from '../components/Common.jsx'
import Receipt from '../components/Receipt.jsx'
import { IMG } from '../data.js'
import { bookingApi, loadRazorpay } from '../lib/api.js'

const rs = (p) => `₹${(p / 100).toFixed(2)}`
const dmy = (iso) => iso?.split('-').reverse().join('-')
const STEPS = ['Submitted', 'Document verification', 'Payment', 'E-ticket']
const stepIndex = { pending_verification: 1, document_rejected: 1, verified: 2, payment_pending: 2, paid: 3 }

function Stepper({ status }) {
  const cur = stepIndex[status] ?? 0
  return (
    <ol className="stepper">
      {STEPS.map((s, i) => <li key={s} className={i < cur || (status === 'paid' && i === 3) ? 'done' : i === cur ? 'now' : ''}><i>{i < cur || status === 'paid' ? '✓' : i + 1}</i><span>{s}</span></li>)}
    </ol>
  )
}

export default function BookingStatus() {
  const { bookingId } = useParams()
  const [sp] = useSearchParams()
  const token = sp.get('t') || ''
  const [b, setB] = useState(null)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState(sp.get('new') ? 'Booking request received. We have emailed you a private link to this page.' : '')
  const [busy, setBusy] = useState(false)
  const [reason, setReason] = useState('')
  const [newDoc, setNewDoc] = useState(null)
  const timer = useRef()

  const load = useCallback(async (silent) => {
    try { setB(await bookingApi.get(bookingId, token)); if (!silent) setErr('') }
    catch (e) { if (!silent) setErr(e.message) }
  }, [bookingId, token])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    clearInterval(timer.current)
    if (b && ['pending_verification', 'payment_pending'].includes(b.status)) timer.current = setInterval(() => load(true), 20000)
    return () => clearInterval(timer.current)
  }, [b, load])

  const pay = async () => {
    setErr(''); setMsg(''); setBusy(true)
    try {
      if (!(await loadRazorpay())) throw new Error('Unable to load Razorpay checkout. Please check your internet connection.')
      const o = await bookingApi.pay(bookingId, token)
      if (o.alreadyPaid) { await load(); setBusy(false); return }
      const rzp = new window.Razorpay({
        key: o.keyId, amount: o.amount, currency: o.currency, order_id: o.orderId, name: 'Surkanda Devi Ropeway',
        description: `Booking ${o.bookingId}`, prefill: { name: o.name, email: o.email, contact: o.phone }, theme: { color: '#0c3a3a' },
        handler: async (response) => {
          try { const r = await bookingApi.verify(bookingId, token, response); setMsg(r.message); await load() }
          catch (e) { setErr(`Payment was received by the gateway but confirmation needs a moment. Do not pay again — refresh this page in a minute, or contact the ticket desk with Booking ID ${bookingId}. (${e.message})`); load(true) }
          finally { setBusy(false) }
        },
        modal: { ondismiss: () => setBusy(false) },
      })
      rzp.on('payment.failed', (r) => { setErr(r.error?.description || 'Payment failed. You can try again.'); setBusy(false) })
      rzp.open()
    } catch (e) { setErr(e.message); setBusy(false) }
  }

  const cancel = async () => {
    const p = b.policy
    const text = b.status === 'paid'
      ? `Cancel this booking? Refund: ${rs(p.refundAmount)} (${p.refundPercent}%) to your original payment method. This cannot be undone.`
      : 'Cancel this booking request? This cannot be undone.'
    if (!window.confirm(text)) return
    setBusy(true); setErr('')
    try { const r = await bookingApi.cancel(bookingId, token, reason.trim()); setMsg(r.message); await load() } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }

  const reupload = async (e) => {
    e.preventDefault()
    if (!newDoc) return setErr('Please choose a file.')
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(newDoc.type) || newDoc.size > 5 * 1024 * 1024) return setErr('Document must be PDF, JPG or PNG up to 5 MB.')
    setBusy(true); setErr('')
    try { const body = new FormData(); body.append('idDocument', newDoc); const r = await bookingApi.reupload(bookingId, token, body); setMsg(r.message); setNewDoc(null); await load() } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }

  if (!token) return <Wrap><div className="panel center"><h3 style={{ justifyContent: 'center' }}>Open your private booking link</h3><p>Use the link in your booking email, or <Link to="/book-tickets" style={{ textDecoration: 'underline' }}>request it again</Link>.</p></div></Wrap>
  if (!b) return <Wrap>{err ? <div className="panel center"><h3 style={{ justifyContent: 'center' }}>Booking not found</h3><p>{err}</p><Link to="/book-tickets" className="btn btn-dark" style={{ marginTop: 18 }}>Book Tickets</Link></div> : <div className="panel center"><p>Loading your booking…</p></div>}</Wrap>

  const cancelled = b.status === 'cancelled'
  return (
    <Wrap>
      <div className="status-grid">
        <div className="panel">
          <div className="status-head">
            <div><small>Booking ID</small><h3 style={{ marginBottom: 0 }}>{b.bookingId}</h3></div>
            <span className={`badge ${b.status}`}>{b.status.replace('_', ' ')}</span>
          </div>
          {!cancelled && <Stepper status={b.status} />}
          {msg && <div className="success" role="status">{msg}</div>}
          {err && <div className="note" role="alert" style={{ background: '#fdecea', borderColor: '#d33', color: '#8a1f1f' }}>{err}</div>}

          {b.status === 'pending_verification' && <div className="note"><FiClock style={{ verticalAlign: '-2px' }} /> <b>Document under verification.</b> We will email <b>{b.email}</b> as soon as it is approved (usually within a few hours during working time). This page refreshes automatically.</div>}

          {b.status === 'document_rejected' && (
            <form onSubmit={reupload}>
              <div className="note" style={{ background: '#fdecea', borderColor: '#d33', color: '#8a1f1f' }}><FiAlertTriangle style={{ verticalAlign: '-2px' }} /> <b>Document not accepted.</b>{b.document?.reviewNote ? ` Reason: ${b.document.reviewNote}` : ''}</div>
              <div className="field"><label htmlFor="nd"><FiUpload style={{ verticalAlign: '-2px' }} /> Upload a new photo ID (PDF/JPG/PNG, max 5 MB)</label><input id="nd" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setNewDoc(e.target.files?.[0] || null)} /></div>
              <button className="btn btn-primary" disabled={busy} type="submit">{busy ? 'Uploading…' : 'Submit new document'}</button>
            </form>
          )}

          {['verified', 'payment_pending'].includes(b.status) && (
            <div>
              <div className="success"><FiCheckCircle style={{ verticalAlign: '-2px' }} /> <b>Document verified.</b> You can now complete the payment.</div>
              <button className="btn btn-primary" onClick={pay} disabled={busy} style={{ width: '100%', justifyContent: 'center', opacity: busy ? .65 : 1 }}><FiCreditCard /> {busy ? 'Please wait…' : `Pay ${rs(b.amount)} securely`}</button>
              <small style={{ display: 'block', marginTop: 8, color: 'var(--muted)' }}>Secured by Razorpay (UPI, cards, netbanking, wallets). If money is debited but the ticket is not shown, do not pay again — it will be confirmed automatically.</small>
            </div>
          )}

          {b.status === 'paid' && b.ticket && (
            <div>
              <div className="success"><FiCheckCircle style={{ verticalAlign: '-2px' }} /> <b>Payment confirmed.</b> Your e-ticket is below and has been emailed to {b.email}.</div>
              <div className="actions">
                <a className="btn btn-dark" href={bookingApi.ticketUrl(b.bookingId, token)}><FiDownload /> Download PDF ticket</a>
                <button className="btn btn-line" type="button" onClick={() => window.print()}>Print</button>
              </div>
              <Receipt ticket={b.ticket} />
            </div>
          )}

          {cancelled && (
            <div>
              <div className="note" style={{ background: '#fdecea', borderColor: '#d33', color: '#8a1f1f' }}><FiXCircle style={{ verticalAlign: '-2px' }} /> <b>This booking is cancelled</b>{b.cancellation?.by === 'admin' ? ' by the ropeway team' : ''}.{b.cancellation?.reason ? ` Reason: ${b.cancellation.reason}.` : ''}</div>
              {b.cancellation?.refundAmount > 0 && <p><b>Refund {rs(b.cancellation.refundAmount)}:</b> {{ processed: 'processed to your original payment method.', initiated: 'initiated — usually reflects in 5–7 working days.', failed: 'queued — our team will process it manually and email you.', none: 'pending.' }[b.cancellation.refundStatus]}</p>}
              <Link to="/book-tickets" className="btn btn-dark" style={{ marginTop: 16 }}>Book again</Link>
            </div>
          )}
        </div>

        <div className="panel summary no-print">
          <h3>Booking summary</h3>
          <div className="row"><span>Guest</span><span>{b.name}</span></div>
          <div className="row"><span>Visit date</span><span>{dmy(b.visitDate)}</span></div>
          <div className="row"><span>Tickets</span><span>{b.quantity}</span></div>
          <div className="row total"><span>Total</span><span>{rs(b.amount)}</span></div>

          {!cancelled && b.policy?.allowed && (
            <div style={{ marginTop: 26 }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Cancel booking</h3>
              <p style={{ fontSize: '.85rem', marginBottom: 10 }}>{b.status === 'paid' ? `Cancel online until ${new Date(b.policy.cutoff).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}. Refund: ${rs(b.policy.refundAmount)} (${b.policy.refundPercent}%).` : 'No payment taken yet — cancelling is free.'}</p>
              <div className="field"><input placeholder="Reason (optional)" maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} /></div>
              <button className="btn btn-line" onClick={cancel} disabled={busy}>Cancel booking</button>
            </div>
          )}
          {!cancelled && b.policy && !b.policy.allowed && <p style={{ fontSize: '.85rem', marginTop: 20 }}>{b.policy.reason}</p>}
        </div>
      </div>
    </Wrap>
  )
}

function Wrap({ children }) {
  return (
    <>
      <PageHero title="Your Booking" crumb="Booking" image={IMG('cabins-blue-sky')} />
      <section className="section"><div className="container">{children}</div></section>
    </>
  )
}

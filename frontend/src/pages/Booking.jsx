import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCalendar, FiCheck, FiUsers, FiUpload } from 'react-icons/fi'
import { PageHero, Reveal } from '../components/Common.jsx'
import { SITE, IMG } from '../data.js'
import { bookingApi } from '../lib/api.js'

const istToday = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10)
const fallbackCfg = { pricePaise: SITE.price * 100, gstPercent: 5, maxQty: 9, itemName: 'Adult 2 way', maxDate: undefined, cancellation: { cutoffHours: 24, refundPercent: 100 } }

export default function Booking() {
  const nav = useNavigate()
  const [cfg, setCfg] = useState(fallbackCfg)
  const [f, setF] = useState({ name: '', phone: '', email: '', date: istToday(), qty: 1 })
  const [file, setFile] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [lookup, setLookup] = useState({ id: '', email: '' })
  const [lookupMsg, setLookupMsg] = useState('')
  useEffect(() => { bookingApi.config().then(setCfg).catch(() => {}) }, [])
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const sum = useMemo(() => {
    const q = Number(f.qty); const rate = Math.round(cfg.pricePaise / (1 + cfg.gstPercent / 100))
    const taxable = rate * q; const gst = Math.round((taxable * cfg.gstPercent) / 200); const total = cfg.pricePaise * q
    return { rate, taxable, gst, total, roundOff: total - taxable - gst * 2 }
  }, [f.qty, cfg])
  const rs = (p) => `₹${(p / 100).toFixed(2)}`

  const submit = async (e) => {
    e.preventDefault(); setErr('')
    if (f.name.trim().length < 2) return setErr('Please enter your full name.')
    if (!/^[6-9]\d{9}$/.test(f.phone.trim())) return setErr('Please enter a valid 10-digit mobile number.')
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setErr('Please enter a valid email — all updates and your ticket come here.')
    if (f.date < istToday()) return setErr('Please choose today or a future date.')
    if (!file) return setErr('Please upload a valid photo ID document.')
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) return setErr('ID document must be PDF, JPG or PNG and up to 5 MB.')
    setBusy(true)
    try {
      const body = new FormData()
      body.append('name', f.name.trim()); body.append('phone', f.phone.trim()); body.append('email', f.email.trim())
      body.append('visitDate', f.date); body.append('quantity', f.qty); body.append('idDocument', file)
      const r = await bookingApi.create(body)
      nav(`/booking/${r.bookingId}?t=${r.accessToken}&new=1`)
    } catch (error) { setErr(error.message); setBusy(false) }
  }

  const findBooking = async (e) => {
    e.preventDefault(); setLookupMsg('')
    try { const r = await bookingApi.resendLink(lookup.id.trim(), lookup.email.trim()); setLookupMsg(r.message) } catch (error) { setLookupMsg(error.message) }
  }

  return (
    <>
      <PageHero title="Book Ropeway Tickets" crumb="Book Tickets" image={IMG('cabins-blue-sky')} text={`Price per ticket: ₹${cfg.pricePaise / 100} (inclusive of GST).`} />
      <section className="section">
        <div className="container booking">
          <Reveal>
            <form className="panel" onSubmit={submit} noValidate>
              <h3><FiUsers /> Booking details</h3>
              <div className="steps-mini"><span className="on">1. Details &amp; ID</span><span>2. Verification</span><span>3. Payment</span><span>4. E-ticket</span></div>
              <div className="note"><b>How it works:</b> submit your details and photo ID now. Our team verifies the document, then you get an email to pay securely. Your e-ticket is emailed right after payment.</div>
              {err && <div className="note" role="alert" style={{ background: '#fdecea', borderColor: '#d33', color: '#8a1f1f' }}>{err}</div>}
              <div className="field"><label htmlFor="n">Full name</label><input id="n" required value={f.name} onChange={set('name')} placeholder="As on your ID" /></div>
              <div className="two">
                <div className="field"><label htmlFor="p">Mobile number</label><input id="p" required inputMode="numeric" maxLength={10} value={f.phone} onChange={set('phone')} placeholder="10-digit number" /></div>
                <div className="field"><label htmlFor="e">Email (updates &amp; e-ticket)</label><input id="e" required type="email" value={f.email} onChange={set('email')} placeholder="you@example.com" /></div>
              </div>
              <div className="two">
                <div className="field"><label htmlFor="d"><FiCalendar style={{ verticalAlign: '-2px' }} /> Visit date</label><input id="d" type="date" min={istToday()} max={cfg.maxDate} value={f.date} onChange={set('date')} /></div>
                <div className="field"><label htmlFor="q">Number of tickets</label><select id="q" value={f.qty} onChange={set('qty')}>{Array.from({ length: cfg.maxQty }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} Ticket{n > 1 ? 's' : ''}</option>)}</select></div>
              </div>
              <div className="field"><label htmlFor="idDocument"><FiUpload style={{ verticalAlign: '-2px' }} /> Photo ID document (PDF/JPG/PNG, max 5 MB)</label><input id="idDocument" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" required onChange={(e) => setFile(e.target.files?.[0] || null)} /><small>Aadhaar / Driving licence / Passport / Voter ID. Used only for entry verification and deleted after your visit.</small></div>
              <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%', justifyContent: 'center', opacity: busy ? .65 : 1 }}>{busy ? 'Submitting…' : 'Submit for Verification'}</button>
              <small style={{ display: 'block', marginTop: 10, color: 'var(--muted)' }}>No payment is taken at this step.</small>
            </form>
          </Reveal>
          <Reveal delay={120}>
            <div className="panel summary">
              <h3>Price summary</h3>
              <div className="row"><span>{cfg.itemName}</span><span>{rs(sum.rate)} × {f.qty}</span></div>
              <div className="row"><span>Amount</span><span>{rs(sum.taxable)}</span></div>
              <div className="row"><span>SGST ({cfg.gstPercent / 2}%)</span><span>{rs(sum.gst)}</span></div>
              <div className="row"><span>CGST ({cfg.gstPercent / 2}%)</span><span>{rs(sum.gst)}</span></div>
              {sum.roundOff !== 0 && <div className="row"><span>Round off</span><span>{sum.roundOff < 0 ? '-' : ''}{rs(Math.abs(sum.roundOff))}</span></div>}
              <div className="row total"><span>Total payable</span><span>{rs(sum.total)}</span></div>
              <ul>
                <li><FiCheck /> Two-way ropeway ride included</li>
                <li><FiCheck /> Valid for the selected date only</li>
                <li><FiCheck /> Pay only after your document is verified</li>
                <li><FiCheck /> Cancel online: free before payment; refund as per <a href="/refund-policy" style={{ textDecoration: 'underline' }}>policy</a> after</li>
              </ul>
            </div>
            <form className="panel" onSubmit={findBooking} style={{ marginTop: 24, padding: 28 }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 10 }}>Already booked?</h3>
              <p style={{ fontSize: '.88rem', marginBottom: 14 }}>Lost your email? Enter Booking ID and email — we will resend your private booking link.</p>
              <div className="field"><input required placeholder="Booking ID (e.g. SR261031AB12CD)" value={lookup.id} onChange={(e) => setLookup({ ...lookup, id: e.target.value })} /></div>
              <div className="field"><input required type="email" placeholder="Email used for booking" value={lookup.email} onChange={(e) => setLookup({ ...lookup, email: e.target.value })} /></div>
              <button className="btn btn-line" type="submit">Resend link</button>
              {lookupMsg && <p style={{ fontSize: '.88rem', marginTop: 12 }}>{lookupMsg}</p>}
            </form>
          </Reveal>
        </div>
      </section>
    </>
  )
}

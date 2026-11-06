import { useState } from 'react'
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi'
import { PageHero, Reveal } from '../components/Common.jsx'
import { SITE, IMG } from '../data.js'
import { apiRequest } from '../lib/api.js'

export default function Contact() {
  const [f, setF] = useState({ name: '', phone: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setSent(false); setBusy(true)
    try {
      const result = await apiRequest('/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) })
      setSent(true); setF({ name: '', phone: '', email: '', message: '' })
    } catch (error) { setErr(error.message) }
    finally { setBusy(false) }
  }
  const items = [
    [<FiMapPin />, 'Address', SITE.address],
    [<FiPhone />, 'Phone / WhatsApp', SITE.phone],
    [<FiMail />, 'Email', SITE.email],
    [<FiClock />, 'Open daily', SITE.hours],
  ]
  return (
    <>
      <PageHero title="Contact Us" image={IMG('mountains-2')} text="Questions about tickets, timings, weather or directions? Call, WhatsApp or write to us. We are happy to help." />
      <section className="section">
        <div className="container contact-grid">
          <div className="contact-list">
            {items.map(([ic, t, v], i) => <Reveal key={t} delay={i * 80}><div className="contact-item"><div className="ic">{ic}</div><div><b>{t}</b><span>{v}</span></div></div></Reveal>)}
          </div>
          <Reveal delay={120}>
            <form className="panel" onSubmit={submit}>
              <h3>Send us a message</h3>
              <p style={{ marginBottom: 18 }}>Share your query and we will get back to you as soon as possible. For urgent help on the day of travel, please call or WhatsApp us.</p>
              {sent && <div className="success" role="status">Thank you! Your enquiry has been sent successfully.</div>}
              {err && <div className="note" role="alert" style={{ background: '#fdecea', borderColor: '#d33', color: '#8a1f1f' }}>{err}</div>}
              <div className="two">
                <div className="field"><label htmlFor="cn">Your name</label><input id="cn" required minLength={2} value={f.name} onChange={set('name')} /></div>
                <div className="field"><label htmlFor="cp">Phone</label><input id="cp" required inputMode="numeric" maxLength={10} value={f.phone} onChange={set('phone')} /></div>
              </div>
              <div className="field"><label htmlFor="ce">Email (optional)</label><input id="ce" type="email" value={f.email} onChange={set('email')} /></div>
              <div className="field"><label htmlFor="cm">Message</label><textarea id="cm" rows={5} required minLength={5} value={f.message} onChange={set('message')} /></div>
              <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send Message'}</button>
            </form>
          </Reveal>
        </div>
      </section>
      <section style={{ paddingBottom: 96 }}><div className="container"><div className="map"><iframe title="Map" loading="lazy" src="https://www.google.com/maps?q=Surkanda+Devi+Ropeway+Kaddukhal+Dhanaulti&output=embed" /></div></div></section>
    </>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi } from '../lib/api.js'

const rs = (p) => `₹${(p / 100).toFixed(2)}`
const TABS = [['pending_verification', 'To verify'], ['verified', 'Awaiting payment'], ['paid', 'Paid'], ['cancelled', 'Cancelled'], ['document_rejected', 'Rejected'], ['', 'All']]

export default function Admin() {
  const [key, setKey] = useState(() => sessionStorage.getItem('sr_admin') || '')
  const [input, setInput] = useState('')
  const [tab, setTab] = useState('pending_verification')
  const [q, setQ] = useState('')
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [busyId, setBusyId] = useState('')
  const api = useMemo(() => (key ? adminApi(key) : null), [key])

  useEffect(() => { document.title = 'Admin – Surkanda Ropeway'; const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex,nofollow'; document.head.appendChild(m); return () => m.remove() }, [])

  const load = useCallback(async () => {
    if (!api) return
    try { setRows(await api.list(tab, q)); setErr('') }
    catch (e) { setErr(e.message); if (/unauthorized/i.test(e.message)) { sessionStorage.removeItem('sr_admin'); setKey('') } }
  }, [api, tab, q])
  useEffect(() => { load() }, [load])

  const act = async (id, fn) => { setBusyId(id); setMsg(''); setErr(''); try { const r = await fn(); setMsg(r.message); await load() } catch (e) { setErr(e.message) } finally { setBusyId('') } }
  const view = async (id) => { try { window.open(await api.documentBlobUrl(id), '_blank', 'noopener') } catch (e) { setErr(e.message) } }
  const approve = (r) => window.confirm(`Approve document for ${r.name}? A payment link will be emailed.`) && act(r.bookingId, () => api.review(r.bookingId, 'approved'))
  const reject = (r) => { const note = window.prompt('Reason for rejection (shown to the customer):'); if (note) act(r.bookingId, () => api.review(r.bookingId, 'rejected', note)) }
  const cancel = (r) => { const reason = window.prompt('Cancellation reason (e.g. closed due to weather). Customer is emailed; paid tickets get a 100% refund:'); if (reason) act(r.bookingId, () => api.cancel(r.bookingId, reason)) }

  if (!key) return (
    <section className="section"><div className="container"><form className="panel" style={{ maxWidth: 440, margin: 'auto' }} onSubmit={(e) => { e.preventDefault(); sessionStorage.setItem('sr_admin', input.trim()); setKey(input.trim()) }}>
      <h3>Staff login</h3>
      <div className="field"><label htmlFor="k">Admin key</label><input id="k" type="password" autoComplete="off" value={input} onChange={(e) => setInput(e.target.value)} /></div>
      {err && <div className="note">{err}</div>}
      <button className="btn btn-dark" type="submit">Enter</button>
    </form></div></section>
  )

  return (
    <section className="section" style={{ paddingTop: 140 }}>
      <div className="container">
        <div className="admin-bar">
          <h2 style={{ fontSize: '2rem' }}>Bookings</h2>
          <div><button className="btn btn-line" onClick={load}>Refresh</button> <button className="btn btn-line" onClick={() => { sessionStorage.removeItem('sr_admin'); setKey('') }}>Log out</button></div>
        </div>
        <div className="admin-tabs">{TABS.map(([v, l]) => <button key={l} className={tab === v ? 'on' : ''} onClick={() => setTab(v)}>{l}</button>)}</div>
        <div className="field" style={{ maxWidth: 360 }}><input placeholder="Search name / phone / email / booking ID / bill no" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        {msg && <div className="success">{msg}</div>}
        {err && <div className="note" style={{ background: '#fdecea', borderColor: '#d33', color: '#8a1f1f' }}>{err}</div>}
        {!rows ? <p>Loading…</p> : rows.length === 0 ? <p>No bookings here.</p> : (
          <div className="admin-list">
            {rows.map((r) => {
              const failedMail = (r.emails || []).filter((m) => m.status !== 'sent').length
              return (
                <div className="panel admin-row" key={r.bookingId} style={{ padding: 22 }}>
                  <div>
                    <b>{r.bookingId}</b> <span className={`badge ${r.status}`}>{r.status.replace('_', ' ')}</span>
                    <div style={{ fontSize: '.92rem', marginTop: 4 }}>{r.name} · {r.phone} · {r.email}</div>
                    <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>Visit {r.visitDate.split('-').reverse().join('-')} · {r.quantity} ticket(s) · {rs(r.amount)}{r.ticket?.billNo ? ` · Bill ${r.ticket.billNo}` : ''}</div>
                    {r.document?.reviewNote && <div style={{ fontSize: '.82rem' }}>Note: {r.document.reviewNote}</div>}
                    {r.cancellation?.refundStatus && r.cancellation.refundStatus !== 'none' && <div style={{ fontSize: '.82rem' }}>Refund {rs(r.cancellation.refundAmount)}: <b>{r.cancellation.refundStatus}</b>{r.cancellation.refundError ? ` (${r.cancellation.refundError})` : ''}</div>}
                    {failedMail > 0 && <div style={{ fontSize: '.82rem', color: '#a33' }}>⚠ {failedMail} email(s) not delivered — check Resend</div>}
                  </div>
                  <div className="admin-actions">
                    {r.document?.originalName && <button className="btn btn-line" onClick={() => view(r.bookingId)}>View ID</button>}
                    {r.status === 'pending_verification' && <><button className="btn btn-dark" disabled={busyId === r.bookingId} onClick={() => approve(r)}>Approve</button><button className="btn btn-line" disabled={busyId === r.bookingId} onClick={() => reject(r)}>Reject</button></>}
                    {['paid', 'verified', 'payment_pending', 'pending_verification'].includes(r.status) && <button className="btn btn-line" disabled={busyId === r.bookingId} onClick={() => cancel(r)}>Cancel</button>}
                    {r.status === 'cancelled' && r.cancellation?.refundStatus === 'failed' && <button className="btn btn-dark" disabled={busyId === r.bookingId} onClick={() => act(r.bookingId, () => api.retryRefund(r.bookingId))}>Retry refund</button>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <p style={{ fontSize: '.8rem', marginTop: 20 }}>Approval is a manual human check of the uploaded ID. Staff must still compare it with the original ID at the counter.</p>
      </div>
    </section>
  )
}

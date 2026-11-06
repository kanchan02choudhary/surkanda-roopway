import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronDown, FiClock, FiShield, FiSun, FiUsers, FiTag } from 'react-icons/fi'
import { FaMountain } from 'react-icons/fa'

export function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { setOn(true); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect() }
    }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`reveal ${on ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

export function SectionHead({ eyebrow, title, text, light }) {
  return (
    <Reveal className="section-head">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <div className="divider"><i /><span /><i /></div>
      {text && <p>{text}</p>}
    </Reveal>
  )
}

export function PageHero({ title, text, image, crumb }) {
  return (
    <section className="page-hero">
      <img src={image} alt="" />
      <div className="container">
        <div className="crumbs"><Link to="/">Home</Link> / {crumb || title}</div>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
    </section>
  )
}

export const ICONS = {
  clock: <FiClock />, shield: <FiShield />, mountain: <FaMountain />,
  users: <FiUsers />, sun: <FiSun />, ticket: <FiTag />,
}

export function Faq({ items }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="faq">
      {items.map((f, i) => (
        <Reveal key={f.q} delay={i * 60}>
          <div className={`faq-item ${open === i ? 'open' : ''}`}>
            <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
              {f.q} <FiChevronDown />
            </button>
            <div className="ans"><p>{f.a}</p></div>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

export function BookingBanner({ image }) {
  return (
    <div className="container">
      <Reveal>
        <div className="banner">
          <img src={image} alt="" loading="lazy" />
          <div className="in">
            <div>
              <span className="eyebrow" style={{ color: '#f6c46b' }}>Plan your darshan</span>
              <h2>Your journey to Ma Surkanda Devi begins here</h2>
              <p>Book in advance, carry your e-ticket and skip the long climb.</p>
            </div>
            <div className="price">
              <small>PER TICKET · INCL. GST</small>
              <b>₹225</b>
              <Link to="/book-tickets" className="btn btn-primary" style={{ marginTop: 18 }}>Book Tickets</Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { FiPhone, FiMail, FiClock, FiMapPin, FiMenu, FiX, FiArrowUp } from 'react-icons/fi'
import { FaWhatsapp, FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa'
import { NAV, SITE } from '../data.js'

function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Surkanda Devi Ropeway home">
      <img src="/images/logo.png" alt="Surkanda Devi Ropeway logo" />
      <span><b>Surkanda Devi</b><small>Ropeway · Dhanaulti</small></span>
    </Link>
  )
}

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <>
      <div className="topbar">
        <div className="container">
          <div className="group">
            <a href={`tel:+${SITE.phoneRaw}`}><FiPhone /> {SITE.phone}</a>
            <a href={`mailto:${SITE.email}`}><FiMail /> {SITE.email}</a>
          </div>
          <div className="group">
            <span><FiClock /> Open daily {SITE.hours}</span>
            <span><FiMapPin /> Kaddukhal, Dhanaulti</span>
          </div>
        </div>
      </div>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <Brand />
          {open && <div className="scrim" onClick={() => setOpen(false)} />}
          <nav className={`nav ${open ? 'open' : ''}`}>
            {open && <button className="burger nav-close" onClick={() => setOpen(false)} aria-label="Close menu"><FiX /></button>}
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `link ${isActive ? 'active' : ''}`}>{n.label}</NavLink>
            ))}
            <Link to="/book-tickets" className="btn btn-primary">Book Now</Link>
          </nav>
          <button className="burger" onClick={() => setOpen(true)} aria-label="Open menu"><FiMenu /></button>
        </div>
      </header>
    </>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="grid">
          <div>
            <Brand />
            <p>{SITE.company} connects devotees to the sacred abode of Ma Surkanda Devi with a safe, modern ropeway in the heart of Uttarakhand.</p>
            <div className="social">
              <a href={`https://wa.me/${SITE.phoneRaw}`} aria-label="WhatsApp"><FaWhatsapp /></a>
              <a href={SITE.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><FaFacebookF /></a>
              <a href={SITE.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
              <a href={SITE.youtube} target="_blank" rel="noreferrer" aria-label="YouTube"><FaYoutube /></a>
            </div>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              {NAV.map((n) => <li key={n.to}><Link to={n.to}>{n.label}</Link></li>)}
              <li><Link to="/book-tickets">Book Tickets</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact Us</h4>
            <ul>
              <li><FiMapPin /> {SITE.address}</li>
              <li><FiPhone /> <a href={`tel:+${SITE.phoneRaw}`}>{SITE.phone}</a></li>
              <li><FiMail /> <a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
              <li><FiClock /> {SITE.hours}</li>
            </ul>
          </div>
          <div>
            <h4>Policies</h4>
            <ul>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/refund-policy">Refund Policy</Link></li>
            </ul>
            <p style={{ marginTop: 22 }}>GSTIN: {SITE.gstin}</p>
          </div>
        </div>
        <div className="bottom">
          <span>© {new Date().getFullYear()} {SITE.company}. All rights reserved.</span>
          <span>Jai Maa Surkanda Devi 🙏</span>
        </div>
      </div>
    </footer>
  )
}

export function Floating() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => setShow(window.scrollY > 600)
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <>
      <button className={`to-top ${show ? 'show' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"><FiArrowUp /></button>
      <a className="float-wa" href={`https://wa.me/${SITE.phoneRaw}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><FaWhatsapp /></a>
    </>
  )
}

export function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <>
      <Header />
      <main><Outlet /></main>
      <Footer />
      <Floating />
    </>
  )
}

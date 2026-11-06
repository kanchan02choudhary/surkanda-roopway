import { Link } from 'react-router-dom'
import { FiMapPin, FiArrowRight } from 'react-icons/fi'
import { PageHero, Reveal, SectionHead, BookingBanner } from '../components/Common.jsx'
import { IMG, NEARBY, TEMPLES_NEARBY } from '../data.js'

export default function Nearby() {
  return (
    <>
      <PageHero title="Nearby Places" crumb="Nearby Places" image={IMG('mountains-3')} text="Make your Surkanda darshan a complete Himalayan journey with temples, lakes and hill stations close by." />

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Pilgrimage circuit" title="Temples to visit nearby" text="Combine your darshan at Surkanda with other revered Devi temples of Garhwal for a truly spiritual trip." />
          <div className="cards">
            {TEMPLES_NEARBY.map((t, i) => (
              <Reveal key={t.title} delay={i * 90}>
                <div className="card place">
                  <img src={IMG(t.img)} alt={t.title} loading="lazy" />
                  <div className="body">
                    <span className="chip">{t.tag}</span>
                    <h3>{t.title}</h3>
                    <p>{t.text}</p>
                    <div className="dist"><FiMapPin /> {t.dist}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow="Beyond the temple" title="Places to explore around Dhanaulti" text="Mountain air, forest walks and sunset views, all within an easy drive of the ropeway." />
          <div className="cards">
            {NEARBY.map((n, i) => (
              <Reveal key={n.title} delay={i * 80}>
                <div className="card place">
                  <img src={IMG(n.img)} alt={n.title} loading="lazy" />
                  <div className="body">
                    <span className="chip">{n.cat}</span>
                    <h3>{n.title}</h3>
                    <p>{n.text}</p>
                    <div className="dist"><FiMapPin /> {n.dist}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="center" style={{ marginTop: 28, fontSize: '.85rem' }}>Distances and drive times are approximate and vary with road and weather conditions.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="quote">
              <span className="eyebrow" style={{ color: '#f6c46b' }}>Sample plan</span>
              <h2>A perfect 2-day Surkanda trip</h2>
              <p><b>Day 1:</b> Reach Dhanaulti, enjoy the Eco Park and a sunset walk. <b>Day 2:</b> Early morning ropeway to Surkanda Devi for darshan and Himalayan views, then lunch, and a stop at Kanatal or Chamba on the way back.</p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 26, justifyContent: 'center' }}>
                <Link to="/book-tickets" className="btn btn-primary">Book Ropeway Tickets <FiArrowRight /></Link>
                <Link to="/plan-your-visit" className="btn btn-outline">How to Reach</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <section style={{ padding: '0 0 96px' }}><BookingBanner image={IMG('cabins-blue-sky')} /></section>
    </>
  )
}

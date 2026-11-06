import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import { PageHero, Reveal, SectionHead, Faq, BookingBanner } from '../components/Common.jsx'
import { FAQS, STEPS, IMG } from '../data.js'

const SPECS = [
  ['Ropeway length', '502 metres'],
  ['Ride time', 'About 5 minutes'],
  ['Base station', 'Kaddukhal, Dhanaulti'],
  ['Temple altitude', '2,756 metres'],
  ['Ticket', '₹225 incl. GST (two-way)'],
  ['Operating hours', '7:00 AM – 5:00 PM'],
]

export default function Ropeway() {
  return (
    <>
      <PageHero title="The Ropeway" image={IMG('cabins-blue-row')} text="Five scenic minutes between Kaddukhal and the doorstep of Ma Surkanda Devi." />

      <section className="section">
        <div className="container split">
          <Reveal className="media">
            <div className="frame"><img src={IMG('cabin-blue')} alt="Ropeway cabins" loading="lazy" /></div>
          </Reveal>
          <Reveal delay={120} className="copy">
            <span className="eyebrow">Overview</span>
            <h2>From Kaddukhal to the temple summit</h2>
            <p>The ropeway starts at Kaddukhal on the Mussoorie–Chamba road and carries you up the slope in comfortable cabins. The line passes over dense forest with open views on both sides.</p>
            <p>It is designed so that families, senior citizens and children can travel together without any climbing, making the darshan accessible to everyone.</p>
            <p>Our trained staff at both stations help with boarding and exit, and from the upper station a short walk brings you to the temple.</p>
          </Reveal>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow="At a glance" title="Ropeway details" />
          <div className="info-grid">
            <Reveal><div className="info"><h3>Key facts</h3><ul>{SPECS.slice(0, 3).map(([a, b]) => <li key={a}><span>{a}</span><b>{b}</b></li>)}</ul></div></Reveal>
            <Reveal delay={100}><div className="info"><h3>Ticket &amp; timing</h3><ul>{SPECS.slice(3).map(([a, b]) => <li key={a}><span>{a}</span><b>{b}</b></li>)}</ul></div></Reveal>
            <Reveal delay={200}><div className="info"><h3>Season timings</h3><ul><li><span>Summer (Apr–Oct)</span><b>7:00 AM – 6:00 PM</b></li><li><span>Winter (Nov–Mar)</span><b>8:00 AM – 5:00 PM</b></li><li><span>Note</span><b>Weather dependent</b></li></ul></div></Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="The cabins" title="Comfort at every height" text="Glass-panelled cabins keep the mountains in full view throughout the ride." />
          <div className="cards">
            {[['cabin-blue-big', 'Panoramic cabins'], ['cabin-yellow-big', 'Bright, easy to spot'], ['tower-view', 'Strong support towers']].map(([img, t], i) => (
              <Reveal key={img} delay={i * 90}>
                <div className="card" style={{ padding: 12 }}>
                  <img src={IMG(img)} alt={t} loading="lazy" style={{ borderRadius: 10, height: 240, width: '100%', objectFit: 'cover' }} />
                  <h3 style={{ padding: '18px 14px 8px' }}>{t}</h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="container">
          <SectionHead eyebrow="Your journey" title="How your ride works" />
          <div className="steps">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 100}><div className="step"><b>{s.n}</b><h3>{s.title}</h3><p>{s.text}</p></div></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="FAQ" title="Ropeway questions answered" />
          <Faq items={FAQS} />
          <div className="center" style={{ marginTop: 40 }}><Link to="/book-tickets" className="btn btn-primary">Book Tickets <FiArrowRight /></Link></div>
        </div>
      </section>
      <section style={{ padding: '0 0 96px' }}><BookingBanner image={IMG('cabin-blue-low')} /></section>
    </>
  )
}

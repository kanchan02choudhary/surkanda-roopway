import { FaPlane, FaTrain, FaCar } from 'react-icons/fa'
import { FiMapPin } from 'react-icons/fi'
import { PageHero, Reveal, SectionHead, Faq, BookingBanner } from '../components/Common.jsx'
import { Link } from 'react-router-dom'
import { FAQS, IMG } from '../data.js'

export default function Visit() {
  return (
    <>
      <PageHero title="Plan Your Visit" image={IMG('mountains-4')} text="Everything you need before you travel: how to reach, when to go and what to carry." />

      <section className="section">
        <div className="container split">
          <Reveal className="copy">
            <span className="eyebrow">How to reach</span>
            <h2>Getting to Kaddukhal</h2>
            <p>The ropeway base station is at Kaddukhal, Dhanaulti, in the Tehri Garhwal district, on the road between Mussoorie and Chamba.</p>
            <div className="route" style={{ marginTop: 26 }}>
              <div><FaPlane /><span><b>By Air</b>Jolly Grant Airport, Dehradun is the nearest, about 85 km away.</span></div>
              <div><FaTrain /><span><b>By Rail</b>Dehradun railway station is the nearest, about 65 km away.</span></div>
              <div><FaCar /><span><b>By Road</b>Well connected via Mussoorie and Chamba, with taxis and buses available.</span></div>
            </div>
          </Reveal>
          <Reveal delay={120} className="media">
            <div className="frame tall"><img src={IMG('tower-up')} alt="Ropeway tower above the forest" loading="lazy" /></div>
          </Reveal>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow="Good to know" title="Timings and tips" />
          <div className="info-grid">
            <Reveal><div className="info"><h3>Operating hours</h3><ul><li><span>Summer (Apr–Oct)</span><b>7:00 AM – 6:00 PM</b></li><li><span>Winter (Nov–Mar)</span><b>8:00 AM – 5:00 PM</b></li><li><span>Timings may vary with weather</span></li></ul></div></Reveal>
            <Reveal delay={100}><div className="info"><h3>Carry with you</h3><ul><li><span>Valid photo ID</span></li><li><span>E-ticket (phone or printout)</span></li><li><span>Warm clothing, even in summer</span></li></ul></div></Reveal>
            <Reveal delay={200}><div className="info"><h3>Travel tips</h3><ul><li><span>Start early for clearer views</span></li><li><span>Wear comfortable footwear</span></li><li><span>Check weather before leaving</span></li></ul></div></Reveal>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow="Best time to visit" title="Choose your season" text="Surkanda Devi is beautiful all year, each season in its own way." />
          <div className="cards">
            {[
              ['Mar – Jun', 'Spring & Summer', 'Clear skies, cool mountain air and the Ganga Dussehra fair. The best season for long Himalayan views.'],
              ['Jul – Aug', 'Monsoon', 'Lush green forests and drifting clouds. Expect rain and occasional ropeway pauses, so check the weather first.'],
              ['Sep – Nov', 'Autumn', 'Crystal clear mornings, Navratri celebrations and some of the sharpest mountain views of the year.'],
            ].map(([when, t, d], i) => (
              <Reveal key={t} delay={i * 90}>
                <div className="card"><span className="eyebrow" style={{ marginBottom: 8 }}>{when}</span><h3>{t}</h3><p>{d}</p></div>
              </Reveal>
            ))}
          </div>
          <p className="center" style={{ marginTop: 26 }}>Visiting in December–February? Expect snow and very cold winds, so carry heavy woollens. <Link to="/nearby-places" style={{ color: 'var(--saffron)', fontWeight: 600 }}>Explore nearby places →</Link></p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Find us" title="Ropeway base station" />
          <Reveal>
            <div className="map">
              <iframe title="Surkanda Devi Ropeway location" loading="lazy" src="https://www.google.com/maps?q=Surkanda+Devi+Ropeway+Kaddukhal+Dhanaulti&output=embed" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section alt">
        <div className="container"><SectionHead eyebrow="FAQ" title="Frequently asked questions" /><Faq items={FAQS} /></div>
      </section>
      <section style={{ padding: '60px 0 96px' }}><BookingBanner image={IMG('cabin-single')} /></section>
    </>
  )
}

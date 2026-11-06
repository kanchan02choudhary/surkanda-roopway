import { Link } from 'react-router-dom'
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import { PageHero, Reveal, SectionHead, BookingBanner } from '../components/Common.jsx'
import { IMG, LEGEND, FESTIVALS } from '../data.js'

export default function Temple() {
  return (
    <>
      <PageHero title="Ma Surkanda Devi Temple" crumb="The Temple" image={IMG('temple-front')} text="A sacred Shakti Peeth crowning the ridge above Dhanaulti, where the mountains meet the divine." />

      <section className="section">
        <div className="container split">
          <Reveal className="copy">
            <span className="eyebrow">Sacred history</span>
            <h2>Where the Goddess is worshipped on the mountain top</h2>
            <p>Surkanda Devi Temple sits at 2,756 metres on the Surkanda peak in Tehri Garhwal, among the highest temples of the Mussoorie–Dhanaulti–Chamba region. It is dedicated to Goddess Parvati as Sati and is counted among the 51 Shakti Peethas.</p>
            <p>For centuries, devotees have walked up this ridge through oak and deodar forest to seek her blessings. Local tradition says the Goddess here fulfils the sincere wishes of every devotee who arrives with faith.</p>
            <ul className="ticks">
              <li><FiCheckCircle /> One of the 51 Shakti Peethas</li>
              <li><FiCheckCircle /> Dedicated to Goddess Parvati (Sati)</li>
              <li><FiCheckCircle /> One of the highest temples in the region, with 360° Himalayan views</li>
            </ul>
          </Reveal>
          <Reveal delay={120} className="media">
            <div className="frame tall"><img src={IMG('temple-top')} alt="Tiered roof of Surkanda Devi Temple" loading="lazy" /></div>
          </Reveal>
        </div>
      </section>

      <section className="section dark">
        <div className="container">
          <SectionHead eyebrow="The legend" title="The story of Sati and Surkanda" text="How a mountain peak became one of the most revered abodes of the Divine Mother." />
          <div className="steps">
            {LEGEND.map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div className="step"><b>{s.n}</b><h3>{s.title}</h3><p>{s.text}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split rev">
          <Reveal className="media">
            <div className="frame"><img src={IMG('temple-side')} alt="Surkanda Devi shrine with marigold garlands" loading="lazy" /><div className="tag"><b>Indra</b>worshipped here</div></div>
          </Reveal>
          <Reveal delay={120} className="copy">
            <span className="eyebrow">Faith & belief</span>
            <h2>A mountain of miracles</h2>
            <p>According to local belief, Lord Indra once worshipped the Goddess at this very peak and regained his lost heavenly kingdom. Ever since, devotees come here to pray for strength, success and a fresh beginning.</p>
            <p>The hill is also known for its rare medicinal herbs. Pilgrims receive leaves of the Rautela plant as prasad, which are believed to carry healing properties and are carried home with great respect.</p>
            <ul className="ticks">
              <li><FiCheckCircle /> Devotees pray for health, success and family happiness</li>
              <li><FiCheckCircle /> Rautela leaves are given as sacred prasad</li>
              <li><FiCheckCircle /> A place of peace, away from the noise of the plains</li>
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow="Inside the complex" title="What you will see" text="From the first gateway to the summit view, every step of the darshan is memorable." />
          <div className="cards">
            {[
              ['temple-gate', 'The Gateway', 'A red stone arch strung with marigold garlands marks the path towards the shrine.'],
              ['temple-side', 'The Sanctum', 'A grey-stone shrine with tiered roofs, decorated with fresh flowers and the sacred Om.'],
              ['mountains-2', 'The Panorama', 'On clear days, the summit reveals peaks such as Bandarpunch, Chaukhamba and the Gangotri–Yamunotri ranges.'],
            ].map(([img, t, d], i) => (
              <Reveal key={t} delay={i * 90}>
                <div className="card" style={{ padding: 12 }}>
                  <img src={IMG(img)} alt={t} loading="lazy" style={{ borderRadius: 10, height: 250, width: '100%', objectFit: 'cover' }} />
                  <div style={{ padding: '20px 14px 10px' }}><h3 style={{ marginBottom: 8 }}>{t}</h3><p>{d}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Festivals & seasons" title="Every season has its own darshan" text="Pick the time that suits your heart, from the roaring fairs of summer to the silent snow of winter." />
          <div className="cards">
            {FESTIVALS.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <div className="card">
                  <span className="eyebrow" style={{ marginBottom: 8 }}>{f.when}</span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <Reveal>
            <div className="quote">
              <span className="eyebrow" style={{ color: '#f6c46b' }}>Ganga Dussehra</span>
              <h2>A festival of faith that fills the hills</h2>
              <p>Every year around Ganga Dussehra, pilgrims from across Uttarakhand and beyond gather here for a grand fair and special worship. What once meant a long, tiring climb now takes just five minutes by ropeway, so more families can join the celebration together.</p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 26, justifyContent: 'center' }}>
                <Link to="/plan-your-visit" className="btn btn-primary">Plan Your Visit</Link>
                <Link to="/nearby-places" className="btn btn-outline">Explore Nearby Places <FiArrowRight /></Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <section style={{ padding: '0 0 96px' }}><BookingBanner image={IMG('cabin-yellow-tower')} /></section>
    </>
  )
}

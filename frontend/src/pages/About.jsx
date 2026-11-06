import { Link } from 'react-router-dom'
import { FiCheckCircle } from 'react-icons/fi'
import { PageHero, Reveal, SectionHead, ICONS, BookingBanner } from '../components/Common.jsx'
import { FEATURES, IMG } from '../data.js'

export default function About() {
  return (
    <>
      <PageHero title="About Us" crumb="About" image={IMG('mountains-3')} text="Making the sacred darshan of Ma Surkanda Devi comfortable and possible for every devotee." />

      <section className="section">
        <div className="container split">
          <Reveal className="copy">
            <span className="eyebrow">Who we are</span>
            <h2>Surkanda Devi Ropeway Project Pvt. Ltd.</h2>
            <p>We operate the ropeway that carries pilgrims from Kaddukhal, Dhanaulti to the upper station near the Surkanda Devi Temple, built in association with Uttarakhand Tourism.</p>
            <p>The 502-metre ropeway uses modern technology and strict safety practices. What once needed a steep trek of about two hours now takes five minutes, opening darshan to people of every age and ability.</p>
            <ul className="ticks">
              <li><FiCheckCircle /> 502 m ropeway, 5-minute ride</li>
              <li><FiCheckCircle /> Built with Uttarakhand Tourism</li>
              <li><FiCheckCircle /> Serving pilgrims all year round</li>
            </ul>
          </Reveal>
          <Reveal delay={120} className="media">
            <div className="frame">
              <img src={IMG('cabin-yellow')} alt="Yellow ropeway cabins" loading="lazy" />
              <div className="tag"><b>5 min</b>to the temple</div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow="Our promise" title="Modern infrastructure, traditional values" />
          <div className="cards">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 70}>
                <div className="card"><div className="ic">{ICONS[f.icon]}</div><h3>{f.title}</h3><p>{f.text}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split rev">
          <Reveal className="media">
            <div className="frame tall"><img src={IMG('temple-side')} alt="Surkanda Devi shrine" loading="lazy" /></div>
          </Reveal>
          <Reveal delay={120} className="copy">
            <span className="eyebrow">Temple significance</span>
            <h2>One of the 51 Shakti Peethas</h2>
            <p>Surkanda Devi is dedicated to Goddess Parvati in her form as Sati. According to tradition, this is where Sati’s head fell, which is why the hill is known as Sirkhanda and later Surkanda.</p>
            <p>Devotees come with prayers for health, success and peace, and carry home Rautela leaves as prasad. Our mission is simple: to make this sacred darshan comfortable, safe and possible for everyone, from the youngest child to the oldest pilgrim.</p>
            <ul className="ticks">
              <li><FiCheckCircle /> Ganga Dussehra is celebrated here on a grand scale</li>
              <li><FiCheckCircle /> Panoramic Himalayan views from the summit</li>
              <li><FiCheckCircle /> A year-round pilgrimage destination</li>
            </ul>
            <Link to="/temple" className="btn btn-dark">Read About the Temple</Link>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: '0 0 96px' }}><BookingBanner image={IMG('cabin-yellow-green')} /></section>
    </>
  )
}

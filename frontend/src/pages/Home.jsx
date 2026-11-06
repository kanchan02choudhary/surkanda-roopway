import { Link } from 'react-router-dom'
import { FiArrowRight, FiCheckCircle, FiMapPin } from 'react-icons/fi'
import { Reveal, SectionHead, ICONS, Faq, BookingBanner } from '../components/Common.jsx'
import { FaYoutube, FaFacebookF, FaInstagram } from 'react-icons/fa'
import { FEATURES, STEPS, FAQS, IMG, SITE, NEARBY, TEMPLES_NEARBY } from '../data.js'

export default function Home() {
  return (
    <>
      <section className="hero">
        <img src={IMG('hero-mountains')} alt="Misty Himalayan ridges near Surkanda Devi" fetchpriority="high" />
        <div className="container">
          <div className="hero-badge"><FiMapPin /> Altitude 2,756 m · Dhanaulti, Uttarakhand</div>
          <span className="jai">॥ जय माँ सुरकंडा देवी ॥</span>
          <h1>Darshan of Maa Surkanda, in just <em>5 minutes</em></h1>
          <p>Ride the ropeway from Kaddukhal through pine forests and Himalayan skies, and reach the sacred Shakti Peeth the comfortable way.</p>
          <div className="actions">
            <Link to="/book-tickets" className="btn btn-primary">Book Ropeway Tickets <FiArrowRight /></Link>
            <Link to="/ropeway" className="btn btn-outline">Explore the Ropeway</Link>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <div className="grid">
            <div className="stat"><b>502 m</b><span>Ropeway Length</span></div>
            <div className="stat"><b>5 min</b><span>Journey Time</span></div>
            <div className="stat"><b>2,756 m</b><span>Temple Altitude</span></div>
            <div className="stat"><b>₹225</b><span>Per Ticket</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <Reveal className="media">
            <div className="frame">
              <img src={IMG('temple-front')} alt="Ma Surkanda Devi Temple decorated with garlands" loading="lazy" />
              <div className="tag"><b>51</b>Shakti Peethas</div>
            </div>
          </Reveal>
          <Reveal delay={120} className="copy">
            <span className="eyebrow">Welcome</span>
            <h2>The divine journey, made easy</h2>
            <p>Ma Surkanda Devi Temple stands high above Kanatal and Dhanaulti at 2,756 metres, and is revered as one of the 51 Shakti Peethas, the place where, according to tradition, the head of Goddess Sati fell. For generations, devotees climbed for nearly two hours to seek her blessings.</p>
            <p>Our ropeway keeps the devotion and removes the strain. In five peaceful minutes, you rise above the forest and arrive close to the temple, with the mountains opening up around you.</p>
            <ul className="ticks">
              <li><FiCheckCircle /> Replaces a two-hour trek with a 5-minute ride</li>
              <li><FiCheckCircle /> Suitable for elderly, children and differently-abled pilgrims</li>
              <li><FiCheckCircle /> Open daily, in every season</li>
            </ul>
            <Link to="/about" className="btn btn-dark">Know More About Us</Link>
          </Reveal>
        </div>
      </section>

      <section className="section alt">
        <div className="container split rev">
          <Reveal className="media">
            <div className="frame tall">
              <img src={IMG('temple-side')} alt="Surkanda Devi shrine" loading="lazy" />
              <div className="tag"><b>Sirkhanda</b>to Surkanda</div>
            </div>
          </Reveal>
          <Reveal delay={120} className="copy">
            <span className="eyebrow">The legend</span>
            <h2>Where the Goddess’s head fell</h2>
            <p>When Sati gave up her life at her father’s yajna, grief-stricken Lord Shiva carried her body across the heavens. Lord Vishnu’s Sudarshan Chakra divided it, and wherever the parts fell, a Shakti Peeth was born.</p>
            <div className="legend-teaser">
              <div><b>The head (sir) of Sati</b> fell on this peak, so it was called <b>Sirkhanda</b>, later <b>Surkanda</b>.</div>
              <div><b>Lord Indra</b> is believed to have prayed here to regain his lost kingdom.</div>
              <div><b>Rautela leaves</b> are given as prasad, believed to carry healing powers.</div>
            </div>
            <Link to="/temple" className="btn btn-dark">Read the Full Story <FiArrowRight /></Link>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Why choose us" title="A ropeway built for pilgrims" text="Modern infrastructure with traditional values, so every devotee reaches the temple safely and comfortably." />
          <div className="cards">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="card">
                  <div className="ic">{ICONS[f.icon]}</div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="container">
          <SectionHead eyebrow="How it works" title="From booking to blessings" text="Four simple steps to your darshan." />
          <div className="steps">
            {STEPS.map((s, i) => (
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
            <div className="frame tall">
              <img src={IMG('cabin-blue-big')} alt="Blue ropeway cabins at Surkanda Devi" loading="lazy" />
            </div>
          </Reveal>
          <Reveal delay={120} className="copy">
            <span className="eyebrow">The experience</span>
            <h2>Glide above the Garhwal Himalayas</h2>
            <p>Spacious glass-panelled cabins give you unhindered views of deodar forests, terraced slopes and layered mountain ridges. On clear days, the high Himalayan peaks appear on the horizon.</p>
            <p>Every cabin is maintained and inspected regularly, and our trained team is present at both stations to guide you through boarding and exit.</p>
            <Link to="/ropeway" className="btn btn-line" style={{ marginTop: 26 }}>See the Ropeway <FiArrowRight /></Link>
          </Reveal>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow="Gallery" title="Glimpses from Surkanda" text="The temple, the cabins and the mountains that surround them." />
          <Reveal>
            <div className="mosaic">
              {['temple-front', 'cabin-yellow-big', 'mountains-2', 'temple-gate', 'cabins-blue-line', 'cabin-blue', 'temple-top'].map((n) => (
                <Link to="/gallery" key={n}><img src={IMG(n)} alt="Surkanda Devi gallery" loading="lazy" /></Link>
              ))}
            </div>
          </Reveal>
          <div className="center" style={{ marginTop: 40 }}>
            <Link to="/gallery" className="btn btn-dark">View Full Gallery</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Watch & follow" title="See the ropeway in action" text="Watch the ride and follow us for the latest videos from Surkanda Devi." />
          <Reveal>
            <div className="watch">
              <div className="video">
                <iframe src={SITE.youtubeEmbed} title="Surkanda Devi Ropeway video" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
              </div>
              <div className="follow">
                <a href={SITE.youtube} target="_blank" rel="noreferrer"><div className="ic yt"><FaYoutube /></div><div><b>YouTube</b><span>Watch the full video</span></div></a>
                <a href={SITE.facebook} target="_blank" rel="noreferrer"><div className="ic fb"><FaFacebookF /></div><div><b>Facebook</b><span>Watch our reel</span></div></a>
                <a href={SITE.instagram} target="_blank" rel="noreferrer"><div className="ic ig"><FaInstagram /></div><div><b>Instagram</b><span>Watch our reel</span></div></a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow="Explore more" title="Temples & places near Surkanda" text="Turn your darshan into a complete Himalayan trip with sacred temples and scenic hill stations close by." />
          <div className="cards">
            {[TEMPLES_NEARBY[0], TEMPLES_NEARBY[1], NEARBY[0]].map((n, i) => (
              <Reveal key={n.title} delay={i * 90}>
                <div className="card place">
                  <img src={IMG(n.img)} alt={n.title} loading="lazy" />
                  <div className="body">
                    <span className="chip">{n.tag || n.cat}</span>
                    <h3>{n.title}</h3>
                    <p>{n.text}</p>
                    <div className="dist"><FiMapPin /> {n.dist}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="center" style={{ marginTop: 40 }}>
            <Link to="/nearby-places" className="btn btn-dark">See All Nearby Places <FiArrowRight /></Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 50 }}>
        <div className="container">
          <SectionHead eyebrow="Questions" title="Before you travel" text="Quick answers to what pilgrims ask us most." />
          <Faq items={FAQS.slice(0, 4)} />
        </div>
      </section>

      <section style={{ padding: '30px 0 96px' }}>
        <BookingBanner image={IMG('cabins-blue-sky')} />
      </section>
    </>
  )
}

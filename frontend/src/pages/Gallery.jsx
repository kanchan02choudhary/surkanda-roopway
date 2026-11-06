import { useEffect, useState } from 'react'
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { PageHero, Reveal } from '../components/Common.jsx'
import { GALLERY, IMG } from '../data.js'

const CATS = ['All', 'Temple', 'Ropeway', 'Himalayas']

export default function Gallery() {
  const [cat, setCat] = useState('All')
  const [idx, setIdx] = useState(null)
  const list = GALLERY.filter((g) => cat === 'All' || g.cat === cat)

  useEffect(() => {
    if (idx === null) return
    const k = (e) => {
      if (e.key === 'Escape') setIdx(null)
      if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % list.length)
      if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + list.length) % list.length)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [idx, list.length])

  return (
    <>
      <PageHero title="Gallery" image={IMG('mountains-4')} text="The temple, the ropeway and the mountains of Surkanda Devi." />
      <section className="section">
        <div className="container">
          <div className="filters">
            {CATS.map((c) => <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}
          </div>
          <div className="g-grid">
            {list.map((g, i) => (
              <Reveal key={g.src}>
                <button className="g-item" onClick={() => setIdx(i)}>
                  <img src={IMG(g.src)} alt={g.cap} loading="lazy" />
                  <span>{g.cap}</span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      {idx !== null && (
        <div className="lightbox" onClick={() => setIdx(null)}>
          <button className="x" onClick={() => setIdx(null)} aria-label="Close"><FiX /></button>
          <button className="pv" onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + list.length) % list.length) }} aria-label="Previous"><FiChevronLeft /></button>
          <button className="nx" onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % list.length) }} aria-label="Next"><FiChevronRight /></button>
          <div onClick={(e) => e.stopPropagation()}>
            <img src={IMG(list[idx].src)} alt={list[idx].cap} />
            <p>{list[idx].cap}</p>
          </div>
        </div>
      )}
    </>
  )
}

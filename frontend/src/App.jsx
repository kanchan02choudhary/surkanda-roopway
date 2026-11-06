import { Routes, Route, Link } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Ropeway from './pages/Ropeway.jsx'
import Temple from './pages/Temple.jsx'
import Nearby from './pages/Nearby.jsx'
import Gallery from './pages/Gallery.jsx'
import Visit from './pages/Visit.jsx'
import Booking from './pages/Booking.jsx'
import BookingStatus from './pages/BookingStatus.jsx'
import Admin from './pages/Admin.jsx'
import Contact from './pages/Contact.jsx'
import { Privacy, Refund } from './pages/Policies.jsx'

function NotFound() {
  return (
    <section className="section center container">
      <h2>Page not found</h2>
      <p style={{ margin: '14px 0 26px' }}>The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-dark">Back to Home</Link>
    </section>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/ropeway" element={<Ropeway />} />
        <Route path="/temple" element={<Temple />} />
        <Route path="/nearby-places" element={<Nearby />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/plan-your-visit" element={<Visit />} />
        <Route path="/book-tickets" element={<Booking />} />
        <Route path="/booking/:bookingId" element={<BookingStatus />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<Privacy />} />
        <Route path="/refund-policy" element={<Refund />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

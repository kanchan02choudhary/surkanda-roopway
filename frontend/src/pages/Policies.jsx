import { useEffect, useState } from 'react'
import { PageHero } from '../components/Common.jsx'
import { bookingApi } from '../lib/api.js'
import { SITE, IMG } from '../data.js'

function Wrap({ title, children }) {
  return (
    <>
      <PageHero title={title} image={IMG('mountains-3')} />
      <section className="section"><div className="container"><div className="policy">{children}</div></div></section>
    </>
  )
}

export function Privacy() {
  return (
    <Wrap title="Privacy Policy">
      <p>{SITE.company} respects your privacy. This page explains what information we collect and how we use it. (Please replace with your final legal text if you already have one.)</p>
      <h3>Information we collect</h3>
      <ul><li>Name, mobile number and email you provide when booking or contacting us</li><li>Booking details such as visit date and number of tickets</li><li>A copy of your photo ID, used only to verify your booking and deleted after your visit</li></ul>
      <h3>How we use it</h3>
      <ul><li>To confirm and manage your ropeway booking</li><li>To respond to your enquiries</li><li>To share important updates about your visit, such as weather closures</li></ul>
      <h3>Sharing</h3>
      <p>We do not sell your personal information. Payment details are handled by our payment partner and are not stored on this website.</p>
      <h3>Contact</h3>
      <p>For privacy questions, write to {SITE.email}.</p>
    </Wrap>
  )
}

export function Refund() {
  const [c, setC] = useState(null)
  useEffect(() => { bookingApi.config().then((x) => setC(x.cancellation)).catch(() => {}) }, [])
  return (
    <Wrap title="Refund & Cancellation Policy">
      <p>Please read this policy before booking. (Replace with your final approved terms if they differ.)</p>
      <h3>Before payment</h3>
      <p>You can cancel a booking request at any time before payment, free of charge, from your private booking page (link in your email).</p>
      <h3>After payment</h3>
      {c ? <p>Paid tickets can be cancelled online until {c.cutoffHours} hours before the start of your visit date. {c.refundPercent}% of the amount paid is refunded to the original payment method; refunds usually reflect within 5–7 working days. After that time, please contact the ticket desk.</p> : <p>Paid tickets can be cancelled online from your booking page until the cut-off time shown there. The refund amount is shown before you confirm.</p>}
      <h3>Weather and operational closures</h3>
      <p>If the ropeway is closed for safety reasons such as storms or strong winds, your booking is cancelled by our team and the full amount is refunded automatically; you will be informed by email.</p>
      <h3>Help</h3>
      <p>Contact {SITE.email} or {SITE.phone} with your Booking ID.</p>
    </Wrap>
  )
}

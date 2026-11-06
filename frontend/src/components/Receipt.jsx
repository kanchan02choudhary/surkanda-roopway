// Renders the server-built ticket (same lines as the PDF/email), so what you see is what is printed.
export default function Receipt({ ticket }) {
  return (
    <div className="receipt" id="ticket-print">
      {ticket.lines.map((l, i) => (
        <div key={i} className={`rl${l.center ? ' c' : ''}${l.bold ? ' b' : ''}${l.big ? ' big' : ''}`}>{l.text || '\u00a0'}</div>
      ))}
      <img className="rqr" src={ticket.qrDataUrl} alt={`QR code for bill ${ticket.billNo}`} width="150" height="150" />
      <div className="rl c">Valid only for the visit date above.</div>
      <div className="rl c">Carry the same original photo ID.</div>
      <div className="rl c b">*** E-TICKET ***</div>
    </div>
  )
}

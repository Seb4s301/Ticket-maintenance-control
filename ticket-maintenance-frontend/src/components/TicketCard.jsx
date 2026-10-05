import StatusBadge from './StatusBadge.jsx'

export default function TicketCard({ ticket, onOpen }) {
  return (
    <button type="button" className="ticket-card" onClick={() => onOpen(ticket.id)}>
      <div className="ticket-card-header">
        <span className="ticket-number">{ticket.ticketNumber}</span>
        <StatusBadge status={ticket.statusCode} />
      </div>
      <h3 className="ticket-title">{ticket.title}</h3>
      <p className="ticket-meta">
        {ticket.priorityCode} · {ticket.categoryCode} · by {ticket.createdByName}
      </p>
    </button>
  )
}

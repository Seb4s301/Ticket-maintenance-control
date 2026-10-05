import {
  PRIORITY_COLORS,
  formatDateTime,
  initialsOf,
  priorityLabel,
} from '../utils.js'
import { ClockIcon, PersonIcon } from './icons.jsx'

function CardChip({ ticket }) {
  if (ticket.statusCode === 'RESOLVED') {
    return (
      <span className="chip" style={{ background: '#dcfce7', color: '#16a34a', borderColor: '#bbf7d0' }}>
        Completado
      </span>
    )
  }
  if (ticket.statusCode === 'CANCELLED') {
    return (
      <span className="chip" style={{ background: '#fee2e2', color: '#dc2626', borderColor: '#fecaca' }}>
        Cancelado
      </span>
    )
  }
  const colors = PRIORITY_COLORS[ticket.priorityCode] ?? PRIORITY_COLORS.LOW
  return (
    <span className="chip" style={{ background: colors.background, color: colors.color, borderColor: `${colors.color}33` }}>
      {priorityLabel(ticket.priorityCode)}
    </span>
  )
}

export default function TicketCard({ ticket, onOpen }) {
  return (
    <button type="button" className="ticket-card" onClick={() => onOpen(ticket.id)}>
      <div className="ticket-card-top">
        <span className="ticket-number">{ticket.ticketNumber}</span>
        <span className="card-dots" aria-hidden="true">···</span>
      </div>
      <h3 className="ticket-card-title">{ticket.title}</h3>
      <p className="ticket-card-desc">{ticket.description}</p>
      <div className="chip-row">
        <CardChip ticket={ticket} />
      </div>
      <div className="ticket-card-footer">
        {ticket.assignedToName ? (
          <span className="assignee">
            <span className="avatar avatar-sm">{initialsOf(ticket.assignedToName)}</span>
            <span className="assignee-name">{ticket.assignedToName}</span>
          </span>
        ) : (
          <span className="assignee unassigned">
            <span className="person-icon">
              <PersonIcon width={14} height={14} />
            </span>
            <span className="assignee-name">Sin asignar</span>
          </span>
        )}
        <span className="card-time">
          {ticket.statusCode === 'RESOLVED' && (
            <span className="check" aria-hidden="true">✓</span>
          )}
          <ClockIcon width={13} height={13} />
          {formatDateTime(ticket.resolvedAt ?? ticket.createdAt)}
        </span>
      </div>
    </button>
  )
}

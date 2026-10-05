import { useEffect, useState } from 'react'
import { ApiError } from '../api/client.js'
import { getTicket, getTicketHistory } from '../api/tickets.js'
import HistoryTimeline from '../components/HistoryTimeline.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

export default function TicketDetailPage({ ticketId, onBack }) {
  const [ticket, setTicket] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getTicket(ticketId), getTicketHistory(ticketId)])
      .then(([ticketData, historyData]) => {
        setTicket(ticketData)
        setHistory(historyData)
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Failed to load the ticket.'),
      )
  }, [ticketId])

  if (error) {
    return (
      <section>
        <button type="button" onClick={onBack}>
          ← Back
        </button>
        <p className="error">{error}</p>
      </section>
    )
  }

  if (!ticket) {
    return <p>Loading…</p>
  }

  return (
    <section>
      <button type="button" onClick={onBack}>
        ← Back
      </button>
      <header className="ticket-header">
        <h1>
          {ticket.ticketNumber} · {ticket.title}
        </h1>
        <StatusBadge status={ticket.statusCode} />
      </header>
      <p>{ticket.description}</p>

      <dl className="ticket-facts">
        <div>
          <dt>Priority</dt>
          <dd>{ticket.priorityCode}</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>{ticket.categoryCode}</dd>
        </div>
        <div>
          <dt>Created by</dt>
          <dd>{ticket.createdByName}</dd>
        </div>
        <div>
          <dt>Assigned to</dt>
          <dd>{ticket.assignedToName ?? 'Unassigned'}</dd>
        </div>
        {ticket.resolution && (
          <div>
            <dt>Resolution</dt>
            <dd>{ticket.resolution}</dd>
          </div>
        )}
      </dl>

      <h2>History</h2>
      <HistoryTimeline entries={history} />
    </section>
  )
}

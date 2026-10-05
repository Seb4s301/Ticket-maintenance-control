import { useEffect, useState } from 'react'
import { ApiError } from '../api/client.js'
import { listTickets } from '../api/tickets.js'
import TicketCard from '../components/TicketCard.jsx'

export default function TicketListPage({ onOpen, onNew }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    listTickets({ limit: 200 })
      .then(setTickets)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Failed to load tickets.'),
      )
      .finally(() => setLoading(false))
  }, [])

  return (
    <section>
      <header className="page-header">
        <h1>Tickets</h1>
        <button type="button" onClick={onNew}>
          New ticket
        </button>
      </header>

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && tickets.length === 0 && <p>No tickets yet.</p>}

      <div className="ticket-list">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}

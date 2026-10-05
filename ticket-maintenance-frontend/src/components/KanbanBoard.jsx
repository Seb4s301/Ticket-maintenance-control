import TicketCard from './TicketCard.jsx'
import {
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_SUBTITLES,
} from '../utils.js'
import { BoardIcon, SearchIcon } from './icons.jsx'

export default function KanbanBoard({
  statuses,
  operators,
  tickets,
  search,
  onSearchChange,
  assignedTo,
  onAssignedToChange,
  hasMore,
  loadingMore,
  onLoadMore,
  onOpen,
}) {
  const query = search.trim().toLowerCase()
  const visible = query
    ? tickets.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(query) ||
          ticket.ticketNumber.toLowerCase().includes(query),
      )
    : tickets

  return (
    <section className="board">
      <div className="board-head">
        <div className="board-title">
          <span className="board-icon">
            <BoardIcon width={22} height={22} />
          </span>
          <h2>Tablero de tickets</h2>
          <span className="count">{visible.length} tickets</span>
        </div>
        <div className="board-tools">
          <div className="board-search">
            <SearchIcon width={16} height={16} />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar ticket"
              aria-label="Buscar ticket"
            />
          </div>
          <select
            className="board-select"
            value={assignedTo ?? ''}
            onChange={(event) =>
              onAssignedToChange(event.target.value ? Number(event.target.value) : null)
            }
            aria-label="Filtrar por operador"
          >
            <option value="">Todos los operadores</option>
            {(operators ?? []).map((operator) => (
              <option key={operator.id} value={operator.id}>
                {operator.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="kanban">
        {statuses.map((status) => {
          const columnTickets = visible.filter((ticket) => ticket.statusCode === status.code)
          return (
            <div key={status.code} className="kanban-column">
              <div className="column-head">
                <span
                  className="column-dot"
                  style={{ backgroundColor: STATUS_COLORS[status.code] ?? '#64748b' }}
                />
                <span className="column-name">{STATUS_LABELS[status.code] ?? status.name}</span>
                <span className="column-count">{columnTickets.length}</span>
                <span className="column-menu" aria-hidden="true">···</span>
              </div>
              <p className="column-subtitle">{STATUS_SUBTITLES[status.code]}</p>
              <div className="column-cards">
                {columnTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} onOpen={onOpen} />
                ))}
                {columnTickets.length === 0 && <div className="column-empty" />}
              </div>
            </div>
          )
        })}
      </div>

      {hasMore && (
        <button
          type="button"
          className="btn btn-secondary btn-block board-more"
          onClick={onLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? 'Cargando…' : 'Cargar más tickets'}
        </button>
      )}
    </section>
  )
}

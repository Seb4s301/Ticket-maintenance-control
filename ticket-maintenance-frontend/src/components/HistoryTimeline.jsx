import { EVENT_COLORS, EVENT_LABELS, formatDateTime, statusLabel } from '../utils.js'

function eventSubtitle(entry) {
  if (entry.comment) return entry.comment
  switch (entry.eventType) {
    case 'CREATED':
      return 'Se registró la incidencia desde el panel de mantenimiento.'
    case 'ASSIGNED':
      return 'El operador quedó responsable del seguimiento.'
    case 'RESOLVED':
      return 'Atención completada.'
    case 'CANCELLED':
      return 'Incidente cerrado por decisión operativa.'
    default:
      return 'Cambio de estado registrado.'
  }
}

function eventTitle(entry) {
  if (entry.eventType === 'STATUS_CHANGED' && entry.toStatusCode) {
    return `Estado actualizado a ${statusLabel(entry.toStatusCode)}`
  }
  return EVENT_LABELS[entry.eventType] ?? entry.eventType
}

export default function HistoryTimeline({ entries }) {
  if (!entries.length) {
    return <p className="drawer-label">Sin historial todavía.</p>
  }

  return (
    <ol className="history-timeline">
      {entries.map((entry) => {
        const color = EVENT_COLORS[entry.eventType] ?? '#3b82f6'
        return (
          <li key={entry.id} className="history-item">
            <span className="history-dot" style={{ color, backgroundColor: color }} />
            <div className="history-date">{formatDateTime(entry.createdAt)}</div>
            <div className="history-title">{eventTitle(entry)}</div>
            <div className="history-sub">{eventSubtitle(entry)}</div>
          </li>
        )
      })}
    </ol>
  )
}

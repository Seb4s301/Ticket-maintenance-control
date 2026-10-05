import { STATUS_COLORS, statusLabel } from '../utils.js'

export default function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] ?? '#64748b'

  return (
    <span
      className="status-badge"
      style={{ backgroundColor: `${color}1f`, color }}
    >
      {statusLabel(status)}
    </span>
  )
}

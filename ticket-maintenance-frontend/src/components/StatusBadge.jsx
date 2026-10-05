const STATUS_COLORS = {
  PENDING: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  DIAGNOSED: '#8b5cf6',
  RESOLVED: '#10b981',
  CANCELLED: '#6b7280',
}

export default function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] ?? '#6b7280'

  return (
    <span className="status-badge" style={{ backgroundColor: color }}>
      {status}
    </span>
  )
}

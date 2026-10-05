import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  WrenchIcon,
} from './icons.jsx'

const STATS = [
  {
    key: 'total',
    label: 'Total de tickets',
    note: 'registrados',
    icon: BriefcaseIcon,
    iconStyle: { background: '#dbeafe', color: '#2563eb' },
  },
  {
    key: 'pending',
    label: 'Pendientes',
    note: 'por atender',
    icon: ClockIcon,
    iconStyle: { background: '#fef3c7', color: '#d97706' },
  },
  {
    key: 'inProgress',
    label: 'En proceso',
    note: 'en atención',
    icon: WrenchIcon,
    iconStyle: { background: '#dbeafe', color: '#2563eb' },
  },
  {
    key: 'resolved',
    label: 'Resueltos',
    note: 'completados',
    icon: CheckCircleIcon,
    iconStyle: { background: '#dcfce7', color: '#16a34a' },
  },
]

export default function StatCards({ tickets }) {
  const values = {
    total: tickets.length,
    pending: tickets.filter((t) => t.statusCode === 'PENDING').length,
    inProgress: tickets.filter((t) => t.statusCode === 'IN_PROGRESS').length,
    resolved: tickets.filter((t) => t.statusCode === 'RESOLVED').length,
  }

  return (
    <div className="stat-grid">
      {STATS.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.key} className="stat-card">
            <span className="stat-icon" style={stat.iconStyle}>
              <Icon width={22} height={22} />
            </span>
            <div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value-row">
                <span className="stat-value">{values[stat.key]}</span>
                <span className="stat-note">{stat.note}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

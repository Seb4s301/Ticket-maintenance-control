export const ROLE_LABELS = {
  OPERATOR: 'Operador',
  USER: 'Usuario',
}

export function initialsFromName(name) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export const STATUS_LABELS = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Proceso',
  DIAGNOSED: 'Diagnosticado',
  RESOLVED: 'Resuelto',
  CANCELLED: 'Cancelado',
}

export const STATUS_COLORS = {
  PENDING: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  DIAGNOSED: '#10b981',
  RESOLVED: '#16a34a',
  CANCELLED: '#ef4444',
}

export const STATUS_SUBTITLES = {
  PENDING: 'En espera de atención',
  IN_PROGRESS: 'El equipo está trabajando',
  DIAGNOSED: 'Hallazgos y plan de reparación',
  RESOLVED: 'Atención completada',
  CANCELLED: 'Incidente cerrado por decisión operativa',
}

export const PRIORITY_LABELS = {
  LOW: 'Prioridad baja',
  MEDIUM: 'Prioridad media',
  HIGH: 'Prioridad alta',
  CRITICAL: 'Prioridad crítica',
}

export const PRIORITY_COLORS = {
  LOW: { background: '#dbeafe', color: '#2563eb' },
  MEDIUM: { background: '#ffedd5', color: '#ea580c' },
  HIGH: { background: '#fee2e2', color: '#dc2626' },
  CRITICAL: { background: '#fee2e2', color: '#b91c1c' },
}

export const CATEGORY_LABELS = {
  HARDWARE: 'Hardware',
  SOFTWARE: 'Software',
  NETWORK: 'Red',
  POWER: 'Energía',
  OTHER: 'Otro',
}

export const NEXT_STATUS = {
  PENDING: 'IN_PROGRESS',
  IN_PROGRESS: 'DIAGNOSED',
  DIAGNOSED: 'RESOLVED',
  RESOLVED: 'IN_PROGRESS',
}

export const CANCELLABLE_STATUSES = ['PENDING', 'IN_PROGRESS']

export const EVENT_LABELS = {
  CREATED: 'Ticket creado',
  ASSIGNED: 'Asignación registrada',
  STATUS_CHANGED: 'Estado actualizado',
  RESOLVED: 'Ticket resuelto',
  REOPENED: 'Ticket reabierto',
  CANCELLED: 'Ticket cancelado',
  EDITED: 'Ticket editado',
}

export const EVENT_COLORS = {
  CREATED: '#3b82f6',
  ASSIGNED: '#f59e0b',
  STATUS_CHANGED: '#3b82f6',
  RESOLVED: '#16a34a',
  REOPENED: '#f59e0b',
  CANCELLED: '#ef4444',
  EDITED: '#8b5cf6',
}

export function statusLabel(code) {
  return STATUS_LABELS[code] ?? code
}

export function priorityLabel(code) {
  return PRIORITY_LABELS[code] ?? code
}

export function advanceLabel(statusCode) {
  if (statusCode === 'RESOLVED') return 'Reabrir ticket'
  return `Avanzar a ${statusLabel(NEXT_STATUS[statusCode])}`
}

export function initialsOf(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function pad(value) {
  return String(value).padStart(2, '0')
}

export function formatDateTime(iso) {
  const date = new Date(iso)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((startOfToday - day) / 86400000)
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`
  if (diffDays === 0) return `Hoy, ${time}`
  if (diffDays === 1) return `Ayer, ${time}`
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}, ${time}`
}

export function formatClock(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatUpdated(date) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((startOfToday - day) / 86400000)
  const time = formatClock(date)
  if (diffDays === 0) return `Actualizado hoy, ${time}`
  if (diffDays === 1) return `Actualizado ayer, ${time}`
  return `Actualizado ${pad(date.getDate())}/${pad(date.getMonth() + 1)}, ${time}`
}

const DRAFT_PREFIX = 'tm-draft-'

function draftKey(ticketId, field) {
  return `${DRAFT_PREFIX}${ticketId}-${field}`
}

export function readDraft(ticketId, field) {
  try {
    return window.localStorage.getItem(draftKey(ticketId, field))
  } catch {
    return null
  }
}

export function writeDraft(ticketId, field, value) {
  try {
    const key = draftKey(ticketId, field)
    if (value) window.localStorage.setItem(key, value)
    else window.localStorage.removeItem(key)
  } catch {
    // localStorage unavailable; drafts stay in memory only
  }
}

export function clearAllDrafts() {
  try {
    const stale = []
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i)
      if (key && key.startsWith(DRAFT_PREFIX)) stale.push(key)
    }
    stale.forEach((key) => window.localStorage.removeItem(key))
  } catch {
    // localStorage unavailable; nothing to clear
  }
}

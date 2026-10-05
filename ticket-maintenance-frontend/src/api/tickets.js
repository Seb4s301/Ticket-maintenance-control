import { request } from './client.js'

const isLookups = (data) =>
  Boolean(data) &&
  Array.isArray(data.statuses) &&
  Array.isArray(data.priorities) &&
  Array.isArray(data.categories) &&
  Array.isArray(data.operators)
const isObject = (data) => Boolean(data) && typeof data === 'object'

export function listTickets(filters = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value)
    }
  }
  const query = params.toString()
  return request(`/api/tickets${query ? `?${query}` : ''}`, { validate: Array.isArray })
}

export function getTicket(id) {
  return request(`/api/tickets/${id}`, { validate: isObject })
}

export function getTicketHistory(id) {
  return request(`/api/tickets/${id}/history`, { validate: Array.isArray })
}

export function getLookups() {
  return request('/api/lookups', { validate: isLookups })
}

export function createTicket(body) {
  return request('/api/tickets', { method: 'POST', body })
}

export function assignTicket(id, body) {
  return request(`/api/tickets/${id}/assign`, { method: 'POST', body })
}

export function transitionTicket(id, body) {
  return request(`/api/tickets/${id}/transition`, { method: 'POST', body })
}

export function updateTicket(id, body) {
  return request(`/api/tickets/${id}`, { method: 'PUT', body })
}

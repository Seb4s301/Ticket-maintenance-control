import { request } from './client.js'

export function listTickets(filters = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value)
    }
  }
  const query = params.toString()
  return request(`/api/tickets${query ? `?${query}` : ''}`)
}

export function getTicket(id) {
  return request(`/api/tickets/${id}`)
}

export function getTicketHistory(id) {
  return request(`/api/tickets/${id}/history`)
}

export function getLookups() {
  return request('/api/lookups')
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

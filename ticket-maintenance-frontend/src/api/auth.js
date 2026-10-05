import { request } from './client.js'

const isSession = (data) => Boolean(data?.token && data?.user)
const isObject = (data) => Boolean(data) && typeof data === 'object'

export function login(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    validate: isSession,
  })
}

export function me() {
  return request('/api/auth/me', { validate: isObject })
}

export function updateProfile(body) {
  return request('/api/auth/profile', { method: 'PUT', body, validate: isSession })
}

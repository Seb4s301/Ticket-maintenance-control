const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5135'
const AUTH_STORAGE_KEY = 'tm-auth'
const REQUEST_TIMEOUT_MS = 20000

export class ApiError extends Error {
  constructor(status, error, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.error = error
  }
}

let memoryAuth = null

export function readStoredAuth() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.token && parsed?.user) return parsed
    }
  } catch {
    // localStorage unavailable; fall back to the in-memory session
  }
  return memoryAuth
}

export function writeStoredAuth(auth) {
  memoryAuth = auth ?? null
  try {
    if (auth) window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
    else window.localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // localStorage unavailable; readStoredAuth serves the in-memory session
  }
}

export async function request(path, { method = 'GET', body, headers, validate } = {}) {
  const auth = readStoredAuth()
  const token = auth?.token ?? null
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 && token && !path.startsWith('/api/auth/login')) {
      const currentToken = readStoredAuth()?.token ?? null
      if (currentToken === token) {
        writeStoredAuth(null)
        window.dispatchEvent(new Event('tm:unauthorized'))
      }
    }
    throw new ApiError(
      response.status,
      data?.error ?? 'UNKNOWN_ERROR',
      data?.message ?? `Request failed with status ${response.status}.`,
    )
  }

  if (validate && !validate(data)) {
    throw new Error('Invalid response from the API.')
  }

  return data
}

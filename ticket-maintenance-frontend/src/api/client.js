const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5135'

export class ApiError extends Error {
  constructor(status, error, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.error = error
  }
}

export async function request(path, { method = 'GET', body, headers } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error ?? 'UNKNOWN_ERROR',
      data?.message ?? `Request failed with status ${response.status}.`,
    )
  }

  return data
}

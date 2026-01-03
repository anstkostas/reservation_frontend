const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export class ApiError extends Error {
  constructor({ message, status, data }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Generic fetch wrapper for API requests
 * Automatically sends cookies for auth requests
 */
export async function apiFetch(
  endpoint,
  { method = 'GET', body, headers = {}, auth = true } = {}
) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: auth ? 'include' : 'same-origin', // <-- send cookies for protected routes
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = null

  try {
    data = await res.json()
  } catch {
    // no body (204, etc.)
  }

  if (!res.ok) {
    throw new ApiError({
      message: data?.message || 'Request failed',
      status: res.status,
      data,
    })
  }

  return data
}
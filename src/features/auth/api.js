import { apiFetch } from '@/lib/fetch'

/**
 * POST /auth/login
 * @param {{ email: string, password: string }} credentials
 * @returns {{ token: string, user: object }}
 */
export function login(credentials) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: credentials,
  })
}

/**
 * GET /auth/me
 * @returns {object} current user
 */
export function me() {
  return apiFetch('/auth/me')
}

export function logout() {
  return apiFetch('/auth/logout', { method: 'POST' })
}

/**
 * POST /auth/signup
 * @param {{
 *   firstname: string,
 *   lastname: string,
 *   email: string,
 *   password: string,
 *   restaurantId?: string | null
 * }} data
 * @returns {{ user: object }}
 */
export function signup(data) {
  return apiFetch('/auth/signup', {
    method: 'POST',
    body: data,
    auth: false,
  })
}

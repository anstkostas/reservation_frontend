import { apiFetch } from '@/lib/fetch'

/**
 * Authenticates a user with email and password.
 * 
 * Logic:
 * - Sends POST request to /auth/login with credentials.
 * - Server sets an HTTP-only cookie representing the session.
 * - Returns the authenticated user object on success.
 * 
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} Response containing user data.
 */
export function login(credentials) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: credentials,
  })
}

/**
 * Retrieves the currently authenticated user's session.
 * 
 * Logic:
 * - Sends GET request to /auth/me using the secure cookie.
 * - Used to persist login state across page reloads.
 * 
 * @returns {Promise<object>} The current user profile.
 */
export function me() {
  return apiFetch('/auth/me')
}

/**
 * Terminates the user's session.
 * 
 * Logic:
 * - Sends POST request to /auth/logout.
 * - Server clears the HTTP-only cookie.
 * 
 * @returns {Promise<void>}
 */
export function logout() {
  return apiFetch('/auth/logout', { method: 'POST' })
}

/**
 * Registers a new user account.
 * 
 * Logic:
 * - Sends POST request to /auth/signup with user details.
 * - Automatically logs the user in (setting cookie) upon successful creation.
 * 
 * @param {object} data - Signup payload (all fields required by backend DTO).
 * @returns {Promise<object>} Response containing the new user data.
 */
export function signup(data) {
  return apiFetch('/auth/signup', {
    method: 'POST',
    body: data,
  })
}

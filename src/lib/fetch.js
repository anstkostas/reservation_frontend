import { normalizeApiError } from "./apiError.js";
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

/**
 * Generic fetch wrapper for API requests
 * Automatically sends cookies for auth requests
 * Normalizes errors
 */
export async function apiFetch(
  endpoint,
  { method = "GET", body, headers = {}, auth = true } = {}
) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      credentials: auth ? "include" : "same-origin", // <-- send cookies for protected routes
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) throw res;
    return res.json();
  } catch (err) {
    // Normalize backend or network error
    const normalizedError = await normalizeApiError(err);
    throw normalizedError;
  }
}

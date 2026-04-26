import { normalizeApiError } from "./apiError";

const BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL) throw new Error("[fetch] VITE_API_URL is not set — add it to your .env file");

/** Options accepted by `apiFetch`. */
export interface FetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
  /** Request timeout in milliseconds. Defaults to 10 000 ms. */
  timeout?: number;
}

/**
 * Generic fetch wrapper for API requests.
 * Automatically sends cookies for auth requests.
 * Normalizes all errors into `ApiError` shape on failure.
 * Aborts with a timeout error if the server does not respond within `timeout` ms.
 *
 * @param {string} endpoint - API path relative to VITE_API_URL (e.g. "/auth/login")
 * @param {FetchOptions} options - Request options
 * @returns {Promise<T>} Parsed JSON response
 * @throws {ApiError} Normalized error with message and optional field-level details
 */
export async function apiFetch<T>(endpoint: string, { method = "GET", body, headers = {}, auth = true, timeout = 10_000 }: FetchOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      credentials: auth ? "include" : "same-origin", // send cookies for protected routes
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) throw res;
    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw { message: "Request timed out. Please try again." };
    }
    // Normalize backend or network error into a consistent ApiError shape
    const normalizedError = await normalizeApiError(err);
    throw normalizedError;
  } finally {
    clearTimeout(timeoutId);
  }
}

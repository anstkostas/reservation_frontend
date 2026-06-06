import { normalizeApiError } from "./apiError";
import i18n from "./i18n";

const BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL) throw new Error("[fetch] VITE_API_URL is not set — add it to your .env file");

// Module-level refresh lock — prevents concurrent refresh races.
// When a refresh is in flight, subsequent 401s share one refresh call.
let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempts to renew the access token by calling POST /auth/refresh.
 * Uses a module-level promise so concurrent 401s share one refresh call.
 *
 * Uses raw fetch (not apiFetch) to avoid triggering the interceptor on itself.
 *
 * @returns {Promise<boolean>} True if refresh succeeded
 */
async function attemptRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async (): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/** Options accepted by `apiFetch`. */
export interface FetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
  /** Request timeout in milliseconds. Defaults to 10 000 ms. */
  timeout?: number;
  /** Internal flag — prevents infinite loops when retrying after refresh. Never pass from external call sites. */
  _isRetry?: boolean;
}

/**
 * Generic fetch wrapper for API requests.
 * Automatically sends cookies for auth requests.
 * On 401, silently attempts a token refresh and retries the original request.
 * Normalizes all errors into `ApiError` shape on failure.
 * Aborts with a timeout error if the server does not respond within `timeout` ms.
 *
 * @param {string} endpoint - API path relative to VITE_API_URL (e.g. "/auth/login")
 * @param {FetchOptions} options - Request options
 * @returns {Promise<T>} Parsed JSON response
 * @throws {ApiError} Normalized error with message and optional field-level details
 */
export async function apiFetch<T>(endpoint: string, { method = "GET", body, headers = {}, auth = true, timeout = 10_000, _isRetry = false }: FetchOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": i18n.language,
        ...headers,
      },
      credentials: auth ? "include" : "same-origin", // send cookies for protected routes
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (res.status === 401 && !_isRetry && auth) {
      const isAuthEndpoint =
        endpoint.includes("/auth/login") ||
        endpoint.includes("/auth/signup") ||
        endpoint.includes("/auth/refresh") ||
        endpoint.includes("/auth/logout");

      if (!isAuthEndpoint) {
        const refreshed = await attemptRefresh();
        if (refreshed) {
          return apiFetch<T>(endpoint, { method, body, headers, auth, timeout, _isRetry: true });
        }
        // Refresh failed — throw so useCurrentUserQuery enters error state (retry:false).
        // data becomes undefined → currentUser undefined → ProtectedRoute redirects to login.
        // resetQueries/invalidateQueries must NOT be called here: both trigger a refetch of
        // the active ["me"] observer, restarting this same 401 cycle indefinitely.
      }
      throw res;
    }

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

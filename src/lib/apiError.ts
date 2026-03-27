import type { ApiError } from "../types/api";

/**
 * Normalizes any thrown error into a consistent `ApiError` shape.
 *
 * Handles three error forms:
 * - A raw `Response` object (thrown by `apiFetch` when `res.ok` is false) — parsed as JSON.
 * - An object with a `message` property (already-normalized or custom errors).
 * - Anything else — returns a generic fallback message.
 *
 * @param {unknown} error - The raw thrown value to normalize.
 * @returns {Promise<ApiError>} Normalized error object.
 */
export async function normalizeApiError(error: unknown): Promise<ApiError> {
  // Check if it's a Response object (fetch failure)
  if (error instanceof Response) {
    try {
      const data = await error.json();
      return {
        message: data?.message || "An error occurred",
        details: Array.isArray(data?.details) ? data.details : undefined,
      };
    } catch {
      return { message: "An error occurred" };
    }
  }

  // If the error is already an object with a message property (already-normalized or custom errors)
  if (error !== null && typeof error === "object" && "message" in error) {
    const err = error as { message: string; details?: unknown };
    return {
      message: err.message,
      details: Array.isArray(err.details) ? err.details : undefined,
    };
  }

  // Fallback
  return { message: "An unexpected error occurred" };
}

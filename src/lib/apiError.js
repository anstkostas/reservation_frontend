/**
 * Normalizes any thrown error into a consistent `{ message, details? }` shape.
 *
 * Handles three error forms:
 * - A raw `Response` object (thrown by `apiFetch` when `res.ok` is false) — parsed as JSON.
 * - An object with a `message` property (already-normalized or custom errors).
 * - Anything else — returns a generic fallback message.
 *
 * @param {Response|Error|object} error - The raw thrown value to normalize.
 * @returns {Promise<{ message: string, details?: Array }>} Normalized error object.
 */
export async function normalizeApiError(error) {
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

  // If the error is already an object with message
  if (error?.message) {
    return {
      message: error.message,
      details: Array.isArray(error.details) ? error.details : undefined,
    };
  }

  // Fallback
  return { message: "An unexpected error occurred" };
}

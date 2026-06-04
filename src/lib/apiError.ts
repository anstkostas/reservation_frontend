import type { TFunction } from "i18next";
import type { ApiError, ApiErrorDetail } from "../types/api";

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
        message: data?.message ?? "An error occurred",
        code: data?.code as string | undefined,
        details: Array.isArray(data?.details)
          ? (data.details as ApiErrorDetail[])
          : undefined,
      };
    } catch {
      return { message: "An error occurred" };
    }
  }

  // If the error is already an object with a message property (already-normalized or custom errors)
  if (error !== null && typeof error === "object" && "message" in error) {
    const err = error as { message: string; code?: string; details?: unknown };
    return {
      message: err.message,
      code: err.code,
      details: Array.isArray(err.details) ? (err.details as ApiErrorDetail[]) : undefined,
    };
  }

  // Fallback
  return { message: "An unexpected error occurred" };
}

/**
 * Returns the localized string for an `ApiError`, falling back to the English message from the backend.
 * Looks up `errors.<code>` in the active locale; if the key is missing, returns `error.message`.
 *
 * @param {TFunction} t - i18next translate function from `useTranslation()`
 * @param {ApiError} error - Normalized error object
 * @returns {string} Localized message, or the backend's English message as fallback
 */
export function resolveErrorMessage(t: TFunction, error: ApiError): string {
  if (error.code) {
    const key = `errors.${error.code}`;
    // Dynamic key — bypasses i18next strict typing intentionally; falls back to message if missing
    const translated = (t as unknown as (k: string) => string)(key);
    if (translated !== key) return translated;
  }
  return error.message;
}

/**
 * Returns the localized string for a field-level validation detail, falling back to the server's message.
 * Looks up `errors.<code>` using the Zod issue code (e.g. `too_small`, `invalid_type`).
 *
 * @param {TFunction} t - i18next translate function from `useTranslation()`
 * @param {ApiErrorDetail} detail - Field-level error detail from the API response
 * @returns {string} Localized message, or the server's English message as fallback
 */
export function resolveDetailMessage(t: TFunction, detail: ApiErrorDetail): string {
  if (detail.code) {
    const key = `errors.${detail.code}`;
    const translated = (t as unknown as (k: string) => string)(key);
    if (translated !== key) return translated;
  }
  return detail.message;
}

/**
 * Unit tests for lib/apiError.ts — error normalization utilities.
 * Type: unit (navigator.onLine stubbed via vi.spyOn; no external deps needed).
 * Covers: normalizeApiError — Response with full payload (message + code + array details);
 *   Response with message only; Response with non-array details treats details as undefined;
 *   Response with null/missing message returns "An error occurred";
 *   Response with non-JSON body (json() rejects) returns "An error occurred";
 *   TypeError + navigator.onLine=false returns NO_INTERNET code;
 *   TypeError + navigator.onLine=true returns SERVER_UNREACHABLE code;
 *   already-normalized object with message + code + array details;
 *   already-normalized object with message only;
 *   already-normalized object with non-array details treats details as undefined;
 *   null and primitive string return "An unexpected error occurred" fallback.
 *   resolveErrorMessage — returns translated string when key found in locale;
 *   falls back to error.message when translation key is missing (t returns key);
 *   falls back to error.message when error has no code.
 *   resolveDetailMessage — returns translated string when key found;
 *   falls back to detail.message when key missing;
 *   falls back to detail.message when detail has no code.
 * Not yet covered: none — all reachable branches covered.
 * Possible expansions: Response body that is valid JSON null (data?.message = undefined → same fallback);
 *   TypeError with non-"Failed to fetch" message strings; already-normalized object where
 *   err.details is an empty array (Array.isArray([]) === true — treated as valid details).
 */

import { vi } from "vitest";
import type { TFunction } from "i18next";
import type { ApiError, ApiErrorDetail } from "@/types/api";
import {
  normalizeApiError,
  resolveErrorMessage,
  resolveDetailMessage,
} from "@/lib/apiError";

/** Minimal TFunction stub — source casts t to (k: string) => string internally. */
const makeT = (fn: (key: string) => string) => fn as unknown as TFunction;

describe("normalizeApiError", () => {
  describe("Response (fetch failure)", () => {
    it("parses JSON and returns message, code, and details", async () => {
      const details: ApiErrorDetail[] = [
        { field: "email", message: "already taken", code: "CONFLICT" },
      ];
      const response = new Response(
        JSON.stringify({ message: "Conflict", code: "CONFLICT", details }),
        { status: 409 }
      );

      expect(await normalizeApiError(response)).toEqual({
        message: "Conflict",
        code: "CONFLICT",
        details,
      });
    });

    it("returns message only when code and details are absent from the body", async () => {
      const response = new Response(JSON.stringify({ message: "Bad request" }), { status: 400 });

      expect(await normalizeApiError(response)).toEqual({
        message: "Bad request",
        code: undefined,
        details: undefined,
      });
    });

    it("treats non-array details field as undefined", async () => {
      const response = new Response(
        JSON.stringify({ message: "Error", code: "ERR", details: "not-an-array" }),
        { status: 400 }
      );

      expect(await normalizeApiError(response)).toEqual({
        message: "Error",
        code: "ERR",
        details: undefined,
      });
    });

    it("returns 'An error occurred' when the message field is null in the body", async () => {
      const response = new Response(JSON.stringify({ message: null }), { status: 500 });

      expect(await normalizeApiError(response)).toEqual({ message: "An error occurred" });
    });

    it("returns 'An error occurred' when the response body is not valid JSON", async () => {
      const response = new Response("not-json", { status: 500 });

      expect(await normalizeApiError(response)).toEqual({ message: "An error occurred" });
    });
  });

  describe("TypeError (network failure)", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns NO_INTERNET code when navigator.onLine is false", async () => {
      vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);

      expect(await normalizeApiError(new TypeError("Failed to fetch"))).toEqual({
        message: "Failed to fetch",
        code: "NO_INTERNET",
      });
    });

    it("returns SERVER_UNREACHABLE code when navigator.onLine is true", async () => {
      vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);

      expect(await normalizeApiError(new TypeError("Failed to fetch"))).toEqual({
        message: "Failed to fetch",
        code: "SERVER_UNREACHABLE",
      });
    });
  });

  describe("already-normalized object", () => {
    it("returns message, code, and details from the object", async () => {
      const details: ApiErrorDetail[] = [{ field: "name", message: "too short" }];

      expect(await normalizeApiError({ message: "Validation failed", code: "INVALID", details })).toEqual({
        message: "Validation failed",
        code: "INVALID",
        details,
      });
    });

    it("returns message only when code and details are absent", async () => {
      expect(await normalizeApiError({ message: "Something failed" })).toEqual({
        message: "Something failed",
        code: undefined,
        details: undefined,
      });
    });

    it("treats non-array details as undefined", async () => {
      expect(
        await normalizeApiError({ message: "Error", code: "ERR", details: "not-an-array" })
      ).toEqual({ message: "Error", code: "ERR", details: undefined });
    });
  });

  describe("fallback (unknown error type)", () => {
    it("returns generic fallback for null", async () => {
      expect(await normalizeApiError(null)).toEqual({ message: "An unexpected error occurred" });
    });

    it("returns generic fallback for a plain string", async () => {
      expect(await normalizeApiError("something went wrong")).toEqual({
        message: "An unexpected error occurred",
      });
    });
  });
});

describe("resolveErrorMessage", () => {
  it("returns the translated string when the key exists in the locale", () => {
    const t = makeT((key) => (key === "errors.NO_INTERNET" ? "No internet connection" : key));
    const error: ApiError = { message: "Failed to fetch", code: "NO_INTERNET" };

    expect(resolveErrorMessage(t, error)).toBe("No internet connection");
  });

  it("falls back to error.message when the translation key is missing (t returns the key)", () => {
    const t = makeT((key) => key); // i18next returns key when translation not found
    const error: ApiError = { message: "Server error", code: "UNKNOWN_CODE" };

    expect(resolveErrorMessage(t, error)).toBe("Server error");
  });

  it("falls back to error.message when the error has no code", () => {
    const t = makeT((key) => `translated:${key}`);
    const error: ApiError = { message: "Something went wrong" };

    expect(resolveErrorMessage(t, error)).toBe("Something went wrong");
  });
});

describe("resolveDetailMessage", () => {
  it("returns the translated string when the key exists in the locale", () => {
    const t = makeT((key) => (key === "errors.too_small" ? "Value is too small" : key));
    const detail: ApiErrorDetail = { field: "people", message: "too_small", code: "too_small" };

    expect(resolveDetailMessage(t, detail)).toBe("Value is too small");
  });

  it("falls back to detail.message when the translation key is missing", () => {
    const t = makeT((key) => key);
    const detail: ApiErrorDetail = { field: "date", message: "Invalid date format", code: "CUSTOM" };

    expect(resolveDetailMessage(t, detail)).toBe("Invalid date format");
  });

  it("falls back to detail.message when the detail has no code", () => {
    const t = makeT((key) => `translated:${key}`);
    const detail: ApiErrorDetail = { field: "time", message: "Required" };

    expect(resolveDetailMessage(t, detail)).toBe("Required");
  });
});

/**
 * Unit tests for lib/fetch.ts — apiFetch wrapper.
 * Type: unit (globalThis.fetch stubbed, normalizeApiError mocked, i18n mocked).
 * Covers: successful 2xx response returns parsed JSON; non-ok response throws normalized error;
 *   request timeout aborts and throws timeout message;
 *   401 on non-auth endpoint retries after successful refresh;
 *   401 on non-auth endpoint throws after failed refresh;
 *   401 on auth endpoints skips refresh and throws immediately;
 *   _isRetry flag skips refresh and throws immediately;
 *   auth:false sends same-origin credentials; default sends include credentials.
 * Not yet covered: auth:false + 401 skips refresh and throws (the `&& auth` guard short-circuit);
 *   concurrent 401s share one refresh call (refreshPromise dedup);
 *   POST body is JSON-stringified correctly; custom headers are merged;
 *   Accept-Language header reflects i18n.language.
 * Possible expansions: attemptRefresh catch branch — refresh fetch rejecting (network throw)
 *   returns false; observably identical to the tested failed-refresh response.
 */

import { vi } from "vitest";
import type { FetchOptions } from "@/lib/fetch";
import type { ApiError } from "@/types/api";
import { normalizeApiError } from "@/lib/apiError";

vi.mock("@/lib/i18n", () => ({ default: { language: "en" } }));
vi.mock("@/lib/apiError", () => ({
  normalizeApiError: vi.fn(),
}));

const BASE_URL = "http://localhost:3000/api";
vi.stubEnv("VITE_API_URL", BASE_URL);

function mockResponse(status: number, body: unknown = {}): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe("apiFetch", () => {
  let apiFetch: (endpoint: string, options?: FetchOptions) => Promise<unknown>;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
    const mod = await import("@/lib/fetch");
    apiFetch = mod.apiFetch;
  });

  afterAll(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("successful response", () => {
    it("returns parsed JSON on a 2xx response", async () => {
      const responseBody = { success: true, data: { id: "1" } };
      mockFetch.mockResolvedValueOnce(mockResponse(200, responseBody));

      const result = await apiFetch("/restaurants");

      expect(result).toEqual(responseBody);
    });
  });

  describe("non-ok response", () => {
    it("throws a normalized error and passes the response to normalizeApiError", async () => {
      const errorRes = mockResponse(400, {});
      mockFetch.mockResolvedValueOnce(errorRes);
      const apiError: ApiError = { message: "Bad request" };
      vi.mocked(normalizeApiError).mockResolvedValueOnce(apiError);

      await expect(apiFetch("/restaurants")).rejects.toEqual(apiError);
      expect(vi.mocked(normalizeApiError)).toHaveBeenCalledWith(errorRes);
    });
  });

  describe("timeout", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("throws a timeout error when the request exceeds the configured timeout", async () => {
      mockFetch.mockImplementationOnce((_url: string, opts: RequestInit): Promise<Response> => {
        return new Promise((_, reject) => {
          opts.signal!.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted", "AbortError"));
          });
        });
      });

      const fetchPromise = apiFetch("/restaurants", { timeout: 5_000 });
      vi.advanceTimersByTime(5_001);

      await expect(fetchPromise).rejects.toEqual({
        message: "Request timed out. Please try again.",
      });
    });
  });

  describe("401 handling", () => {
    it("retries the original request after a successful refresh", async () => {
      const retryBody = { success: true, data: { id: "1" } };
      mockFetch
        .mockResolvedValueOnce(mockResponse(401, {}))          // initial → 401
        .mockResolvedValueOnce(mockResponse(200, {}))          // /auth/refresh → ok
        .mockResolvedValueOnce(mockResponse(200, retryBody));  // retry → success

      const result = await apiFetch("/restaurants");

      expect(result).toEqual(retryBody);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("throws a normalized error when the refresh call fails", async () => {
      mockFetch
        .mockResolvedValueOnce(mockResponse(401, {}))  // initial → 401
        .mockResolvedValueOnce(mockResponse(401, {})); // /auth/refresh → non-ok
      const apiError: ApiError = { message: "Session expired. Please log in again." };
      vi.mocked(normalizeApiError).mockResolvedValueOnce(apiError);

      await expect(apiFetch("/restaurants")).rejects.toEqual(apiError);
    });

    it.each(["/auth/login", "/auth/signup", "/auth/refresh", "/auth/logout"])(
      "does not attempt refresh on auth endpoint %s",
      async (endpoint) => {
        mockFetch.mockResolvedValueOnce(mockResponse(401, {}));
        const apiError: ApiError = { message: "Unauthorized" };
        vi.mocked(normalizeApiError).mockResolvedValueOnce(apiError);

        await expect(apiFetch(endpoint)).rejects.toEqual(apiError);
        // Only the original request — no refresh attempt
        expect(mockFetch).toHaveBeenCalledTimes(1);
      }
    );

    it("does not attempt refresh when _isRetry is true", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(401, {}));
      const apiError: ApiError = { message: "Unauthorized" };
      vi.mocked(normalizeApiError).mockResolvedValueOnce(apiError);

      await expect(apiFetch("/restaurants", { _isRetry: true })).rejects.toEqual(apiError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("credentials", () => {
    it("sends 'include' credentials by default (auth:true)", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(200, {}));

      await apiFetch("/protected");

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/protected`,
        expect.objectContaining({ credentials: "include" })
      );
    });

    it("sends 'same-origin' credentials when auth is false", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(200, {}));

      await apiFetch("/public", { auth: false });

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/public`,
        expect.objectContaining({ credentials: "same-origin" })
      );
    });
  });
});

import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthContextValue } from "./AuthContext";

/**
 * Custom hook to consume the AuthContext.
 *
 * Logic:
 * - Checks if the context is available (ensures usage within `AuthProvider`).
 * - Throws an explicit error if used outside the provider to aid debugging.
 *
 * @returns {AuthContextValue} The auth context value (currentUser, loginAsync, etc.).
 * @throws {Error} If called outside of an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

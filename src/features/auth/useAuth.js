import { useContext } from "react";
import { AuthContext } from "./AuthContext";

/**
 * Custom hook to consume the AuthContext.
 * 
 * Logic:
 * - Checks if the context is available (ensures usage within `AuthProvider`).
 * - Throws an explicit error if used outside the provider to aid debugging.
 * 
 * @returns {object} The auth context value (currentUser, login, logout, etc.).
 * @throws {Error} If called outside of an AuthProvider.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
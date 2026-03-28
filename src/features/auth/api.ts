import { apiFetch } from "@/lib/fetch";
import type { ApiResponse, User } from "@/types/api";
import { Role } from "@/lib/constants";

export interface SignupApiPayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: Role;
  restaurantId?: string | null;
}

/**
 * Authenticates a user with email and password.
 *
 * Logic:
 * - Sends POST request to /auth/login with credentials.
 * - Server sets an HTTP-only cookie representing the session.
 * - Returns the authenticated user object on success.
 *
 * @param {{ email: string; password: string }} credentials - Login credentials
 * @returns {Promise<ApiResponse<User>>} Response containing the authenticated user.
 */
export function login(credentials: { email: string; password: string }): Promise<ApiResponse<User>> {
  return apiFetch<ApiResponse<User>>("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

/**
 * Retrieves the currently authenticated user's session.
 *
 * Logic:
 * - Sends GET request to /auth/me using the secure cookie.
 * - Used to persist login state across page reloads.
 *
 * @returns {Promise<ApiResponse<User>>} The current user profile.
 */
export function me(): Promise<ApiResponse<User>> {
  return apiFetch<ApiResponse<User>>("/auth/me");
}

/**
 * Terminates the user's session.
 *
 * Logic:
 * - Sends POST request to /auth/logout.
 * - Server clears the HTTP-only cookie.
 *
 * @returns {Promise<ApiResponse<null>>}
 */
export function logout(): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>("/auth/logout", { method: "POST" });
}

/**
 * Registers a new user account.
 *
 * Logic:
 * - Sends POST request to /auth/signup with user details.
 * - Automatically logs the user in (setting cookie) upon successful creation.
 *
 * @param {SignupApiPayload} data - Signup payload (form-only fields like confirmPassword and isOwner are stripped before reaching here)
 * @returns {Promise<ApiResponse<User>>} Response containing the new user data.
 */
export function signup(data: SignupApiPayload): Promise<ApiResponse<User>> {
  return apiFetch<ApiResponse<User>>("/auth/signup", {
    method: "POST",
    body: data,
  });
}

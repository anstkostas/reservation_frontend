import { useMutation, useQuery } from "@tanstack/react-query";
import {
  login as apiLogin,
  me as apiMe,
  logout as apiLogout,
  signup as apiSignup,
} from "./api";

/**
 * React Query hook to manage the current user state.
 * 
 * Logic:
 * - Query Key: `['me']` (Unique identifier for this data)
 * - Cache Policy: 5 minutes (`staleTime`). Data remains fresh for 5 mins unless invalidated.
 * - Retry Policy: Disabled. If auth check fails (401), do not retry immediately.
 * - Selection: Extracts `res.data` to return the user object directly.
 * 
 * @returns {UseQueryResult} Query result containing `data` (User) and status flags.
 */
export function useCurrentUserQuery() {
  return useQuery({
    queryKey: ["me"],
    queryFn: apiMe,
    staleTime: 1000 * 60 * 5, // 5 minutes cache overriding default 1min queryClient setting
    retry: false,
    select: (res) => res?.data || null,
  });
}

/**
 * Mutation hook for handling user login.
 * 
 * Logic:
 * - Wraps the `apiLogin` function.
 * - Used by `AuthProvider` to expose login functionality.
 * - On success, the `AuthProvider` will invalidate `['me']` to refresh user state.
 * 
 * @param {object} options - React Query mutation options (e.g., onSuccess, onError).
 * @returns {UseMutationResult} Mutation result with `mutate` function.
 */
export function useLoginMutation(options) {
  return useMutation({
    mutationFn: apiLogin,
    ...options,
  });
}

/**
 * Mutation hook for handling user logout.
 * 
 * Logic:
 * - Wraps `apiLogout`.
 * - IMPORTANT: On success, the query cache (`['me']`) MUST be reset to null to reflect logged-out state.
 * 
 * @param {object} options - React Query mutation options.
 * @returns {UseMutationResult} Mutation result.
 */
export function useLogoutMutation(options) {
  return useMutation({
    mutationFn: apiLogout,
    ...options,
  });
}

/**
 * Mutation hook for user registration.
 * 
 * Logic:
 * - Wraps `apiSignup`.
 * - Treated similarly to login since signup automatically authenticates the user.
 * 
 * @param {object} options - React Query mutation options.
 * @returns {UseMutationResult} Mutation result.
 */
export function useSignupMutation(options) {
  return useMutation({
    mutationFn: apiSignup,
    ...options,
  });
}

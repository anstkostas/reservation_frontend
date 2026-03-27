import { useMutation, useQuery } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import { login as apiLogin, me as apiMe, logout as apiLogout, signup as apiSignup } from "./api";
import type { ApiError, ApiResponse, User } from "@/types/api";
import type { LoginFormValues, SignupFormValues } from "./schemas";

/**
 * React Query hook to manage the current user state.
 *
 * Logic:
 * - Query Key: `['me']` (Unique identifier for this data)
 * - Cache Policy: 5 minutes (`staleTime`). Data remains fresh for 5 mins unless invalidated.
 * - Retry Policy: Disabled. If auth check fails (401), do not retry immediately.
 * - Selection: Extracts `res.data` to return the user object directly.
 *
 * @returns {UseQueryResult<User | null>} Query result containing `data` (User) and status flags.
 */
export function useCurrentUserQuery() {
  return useQuery<ApiResponse<User>, ApiError, User>({
    queryKey: ["me"],
    queryFn: apiMe,
    staleTime: 1000 * 60 * 5, // 5 minutes cache overriding default 1min queryClient setting
    retry: false,
    select: (res) => res.data,
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
 * @param {UseMutationOptions} options - React Query mutation options (e.g., onSuccess, onError).
 * @returns {UseMutationResult} Mutation result with `mutate` function.
 */
export function useLoginMutation(options?: UseMutationOptions<ApiResponse<User>, ApiError, LoginFormValues>) {
  return useMutation<ApiResponse<User>, ApiError, LoginFormValues>({
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
 * @param {UseMutationOptions} options - React Query mutation options.
 * @returns {UseMutationResult} Mutation result.
 */
export function useLogoutMutation(options?: UseMutationOptions<ApiResponse<null>, ApiError, void>) {
  return useMutation<ApiResponse<null>, ApiError, void>({
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
 * @param {UseMutationOptions} options - React Query mutation options.
 * @returns {UseMutationResult} Mutation result.
 */
export function useSignupMutation(options?: UseMutationOptions<ApiResponse<User>, ApiError, SignupFormValues>) {
  return useMutation<ApiResponse<User>, ApiError, SignupFormValues>({
    mutationFn: apiSignup,
    ...options,
  });
}

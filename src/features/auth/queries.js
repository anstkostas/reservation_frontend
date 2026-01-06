import { useMutation, useQuery } from "@tanstack/react-query";
import {
  login as apiLogin,
  me as apiMe,
  logout as apiLogout,
  signup as apiSignup,
} from "./api";

/**
 * Fetch the current user
 * This hook wraps /auth/me
 * useQuery is used to fetch(GET) and cache the current user data
 * const { data, error, isLoading, isSuccess, isError, isFetching, refetch, status } = useQuery({ ... });
 * @return {object} current user
 */
export function useCurrentUserQuery() {
  return useQuery({
    queryKey: ["me"],
    queryFn: apiMe,
    staleTime: 1000 * 60 * 5, // 5 minutes cache overriding default 1min queryClient setting
    retry: false,
  });
}

/**
 * useMutation is like useQuery, but for mutations (POST, PUT, DELETE requests)
 * const { mutate, mutateAsync, data, error, isLoading, isError, isSuccess, reset } = useMutation({ ... });
 */
export function useLoginMutation(options) {
  return useMutation({
    mutationFn: apiLogin,
    ...options,
  });
}

export function useLogoutMutation(options) {
  return useMutation({
    mutationFn: apiLogout,
    ...options,
  });
}

export function useSignupMutation(options) {
  return useMutation({
    mutationFn: apiSignup,
    ...options,
  });
}

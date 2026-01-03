import { useMutation, useQuery } from '@tanstack/react-query'
import { login as apiLogin, me as apiMe, logout as apiLogout } from './api'

/**
 * Fetch the current user
 * This hook wraps /auth/me
 * useQuery is used to fetch(GET) and cache the current user data
 * const { data, error, isLoading, isSuccess, isError, isFetching, refetch, status } = useQuery({ ... });
 * @return {object} current user
 */
export function useCurrentUserQuery() {
  return useQuery(['me'], apiMe, {
    staleTime: 1000 * 60 * 5, // 5 minutes cache overriding default 1min queryClient setting
    retry: false,
  })
}

/**
 * useMutation is like useQuery, but for mutations (POST, PUT, DELETE requests)
 * const { mutate, mutateAsync, data, error, isLoading, isError, isSuccess, reset } = useMutation({ ... });
 */
export function useLoginMutation() {
  return useMutation(apiLogin)
}

export function useLogoutMutation() {
  return useMutation(apiLogout)
}

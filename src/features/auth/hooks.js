// src/auth/hooks.js
import { useQueryClient } from "@tanstack/react-query";
import {
  useCurrentUserQuery,
  useLoginMutation,
  useLogoutMutation,
} from "./queries";

export function useAuth() {
  const queryClient = useQueryClient(); // get the QueryClient instance defined in providers.jsx(nearest QueryClientProvider in React tree)
  const {
    data: currentUser,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useCurrentUserQuery();
  const loginMutation = useLoginMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(["me"]); // refresh current user after login
    },
  });
  const logoutMutation = useLogoutMutation({
    onSuccess: () => {
      queryClient.setQueryData(["me"], null); // clear current user after logout
    },
  });
  return {
    currentUser,
    isLoadingUser,
    userError,
    refetchUser,

    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isLoading,
    loginError: loginMutation.error,
    resetLogin: loginMutation.reset,
    loginStatus: loginMutation.status,

    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isLoading,
    logoutError: logoutMutation.error,
    resetLogout: logoutMutation.reset,
    logoutStatus: logoutMutation.status,
  };
}

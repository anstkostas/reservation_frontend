import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./AuthContext";
import {
  useCurrentUserQuery,
  useLoginMutation,
  useLogoutMutation,
  useSignupMutation,
} from "./queries";

/**
 * Global Authentication Provider.
 * 
 * Purpose:
 * - Orchestrates the entire auth lifecycle (check session, login, signup, logout).
 * - Connects React Query mutations with the global QueryClient to manage cache invalidation.
 * 
 * State Logic:
 * - `currentUser`: Derived from `useCurrentUserQuery` (`['me']` key).
 * - `login/signup`: On success, invalidates `['me']` to force a re-fetch of the user, ensuring the UI reflects the authenticated state.
 * - `logout`: On success, explicitly resets `['me']` to null and invalidates ALL other queries to clear sensitive data (e.g., user's reservations) from the cache.
 * 
 * @param {React.ReactNode} props.children - Child components to wrap.
 */
export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const {
    data: currentUser,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useCurrentUserQuery();

  const loginMutation = useLoginMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(["me"]);
    },
  });

  const signupMutation = useSignupMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(["me"]);
    },
  });

  const logoutMutation = useLogoutMutation({
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries(); // clear all other queries (e.g. user-specific fetched reservations)
    },
  });

  const value = {
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

    signup: signupMutation.mutate,
    signupAsync: signupMutation.mutateAsync,
    isSigningUp: signupMutation.isLoading,
    signupError: signupMutation.error,
    resetSignup: signupMutation.reset,
    signupStatus: signupMutation.status,

    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isLoading,
    logoutError: logoutMutation.error,
    resetLogout: logoutMutation.reset,
    logoutStatus: logoutMutation.status,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

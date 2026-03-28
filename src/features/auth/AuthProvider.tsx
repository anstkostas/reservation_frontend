import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./AuthContext";
import type { AuthContextValue } from "./AuthContext";
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
 * @param {ReactNode} props.children - Child components to wrap.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUserQuery();

  const loginMutation = useLoginMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const signupMutation = useSignupMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const logoutMutation = useLogoutMutation({
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries(); // clear all other queries (e.g. user-specific fetched reservations)
    },
  });

  const value: AuthContextValue = {
    currentUser,
    isLoadingUser,

    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,

    signupAsync: signupMutation.mutateAsync,

    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

import { useQueryClient } from "@tanstack/react-query";
import {
  useCurrentUserQuery,
  useLoginMutation,
  useLogoutMutation,
  useSignupMutation,
} from "./queries";

/**
 * .invalidateQueries(["me"]) forces a refetch of the current user data, currentUser becomes truthy.
 */
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
  const signupMutation = useSignupMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(["me"]);
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

    signup: signupMutation.mutate,
    signupAsync: signupMutation.mutateAsync,
    isSigningUp: signupMutation.isLoading,
    signupError: signupMutation.error,
    resetSignup: signupMutation.reset,
    signupStatus: signupMutation.status,
  };
}

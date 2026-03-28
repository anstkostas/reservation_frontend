import { createContext } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import type { ApiError, ApiResponse, User } from "@/types/api";
import type { LoginFormValues, SignupFormValues } from "./schemas";

// Derive async mutate types from TanStack Query generics — if the mutation
// signature changes, these update automatically.
type LoginMutation = UseMutationResult<ApiResponse<User>, ApiError, LoginFormValues>;
type SignupMutation = UseMutationResult<ApiResponse<User>, ApiError, SignupFormValues>;
type LogoutMutation = UseMutationResult<ApiResponse<null>, ApiError, void>;

export interface AuthContextValue {
  currentUser: User | undefined;
  isLoadingUser: boolean;

  loginAsync: LoginMutation["mutateAsync"];
  isLoggingIn: boolean;

  signupAsync: SignupMutation["mutateAsync"];

  logoutAsync: LogoutMutation["mutateAsync"];
  isLoggingOut: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

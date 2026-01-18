import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth"

/**
 * Higher-Order Component for route protection.
 * 
 * Logic:
 * - Checks global auth state (`currentUser`).
 * - **Loading State**: Renders nothing while determining auth status to prevent flicker.
 * - **Redirection**: If unauthenticated, navigates to `/login` but preserves the attempted path in `state.from`. This allows `LoginForm` to redirect the user back to their intended destination after successful login.
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - The protected content/route.
 */
export default function ProtectedRoute({ children }) {
  const { currentUser, isLoadingUser } = useAuth();
  const location = useLocation();

  if (isLoadingUser) return null;

  if (!currentUser) {
    // state: { from: location } saves the originally attempted route
    // replace: true removes the protected route from the history stack so “back” doesn’t go there.
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  return children;
}

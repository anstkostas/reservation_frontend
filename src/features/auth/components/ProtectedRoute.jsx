import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth"

/**
 * Higher-Order Component for route protection.
 *
 * Logic:
 * - Checks global auth state (`currentUser`).
 * - **Loading State**: Renders nothing while determining auth status to prevent flicker.
 * - **Redirection**: If unauthenticated, navigates to `/login` but preserves the attempted path in `state.from`. This allows `LoginForm` to redirect the user back to their intended destination after successful login.
 * - **Role Guard**: If a `role` is specified and the user's role doesn't match, redirects them to their own home route — guards against manual URL navigation to the wrong role's page.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The protected content/route.
 * @param {string} [props.role] - Required role ('customer' | 'owner'). If provided, redirects mismatched roles.
 */
export default function ProtectedRoute({ children, role }) {
  const { currentUser, isLoadingUser } = useAuth();
  const location = useLocation();

  if (isLoadingUser) return null;

  if (!currentUser) {
    // state: { from: location } saves the originally attempted route
    // replace: true removes the protected route from the history stack so "back" doesn't go there.
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  if (role && currentUser.role !== role) {
    // Redirect to the user's own home rather than showing a broken page from a 403 API response
    const roleHome = currentUser.role === "owner" ? "/owner-dashboard" : "/my-reservations";
    return <Navigate to={roleHome} replace />;
  }

  return children;
}

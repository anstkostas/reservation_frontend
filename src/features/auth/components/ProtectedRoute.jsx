import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks";

export default function ProtectedRoute({ children }) {
  const { currentUser, isLoadingUser } = useAuth();
  const location = useLocation();

  if (isLoadingUser) return null;

  if (!currentUser) {
    // state: { from: location } saves the originally attempted route
    // replace: true removes the protected route from the history stack so “back” doesn’t go there.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

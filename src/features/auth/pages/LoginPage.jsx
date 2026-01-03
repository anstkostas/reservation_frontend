import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "@/features/auth/components/LoginForm";
import { useAuth } from "@/features/auth/hooks";

export default function LoginPage() {
  const { currentUser, isLoadingUser } = useAuth();
  const location = useLocation();
  // From comes from ./src/features/auth/components/ProtectedRoute.jsx
  const from = location.state?.from?.pathname || "/home";
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingUser && currentUser) {
      // navigate to intended page after login
      navigate(from, { replace: true }); // Remove login page from history, no back navigation
    }
  }, [isLoadingUser, currentUser, navigate, from]);

  if (isLoadingUser || currentUser) return null;

  // Show login form only if not logged in
  return <LoginForm />;
}

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "@/features/auth/components/LoginForm";
import SignupForm from "@/features/auth/components/SignupForm";
import { useAuth } from "@/features/auth/hooks";

export default function LoginPage() {
  const { currentUser, isLoadingUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // From comes from ./src/features/auth/components/ProtectedRoute.jsx
  const from = location.state?.from?.pathname || "/splash";

  // auth mode: login | signup
  const [mode, setMode] = useState("login");

  useEffect(() => {
    if (!isLoadingUser && currentUser) {
      // navigate to intended page after login
      navigate(from, { replace: true }); // Remove login page from history, no back navigation
    }
  }, [isLoadingUser, currentUser, navigate, from]);

  if (isLoadingUser || currentUser) return null;

  // Show login form only if not logged in
  if (mode === "login") {
    return <LoginForm onSwitchToSignup={() => setMode("signup")} />;
  } else if (mode === "signup") {
    return <SignupForm onSwitchToLogin={() => setMode("login")} />;
  } else {
    return null;
  }
}

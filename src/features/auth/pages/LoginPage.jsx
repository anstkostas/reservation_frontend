import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "@/features/auth/components/LoginForm";
import SignupForm from "@/features/auth/components/SignupForm";
import { useAuth } from "@/features/auth/useAuth";

export default function LoginPage() {
  const { currentUser, isLoadingUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // From is a string URL
  const from = location.state?.from || "/";
  const [mode, setMode] = useState(
    location.state?.mode === "signup" ? "signup" : "login"
  );

  useEffect(() => {
    if (!isLoadingUser && currentUser) {
      let target;
      if (currentUser.role === "owner") {
        target = "/owner-dashboard";
      } else {
        target = from === "/" || from === "/login" ? "/my-reservations" : from;
      }

      navigate(target, { replace: true });
    }
  }, [isLoadingUser, currentUser, navigate, from]);

  if (isLoadingUser || currentUser) return null;

  return (
    <div className="flex-1 flex items-center justify-center bg-muted/40 p-4">
      {mode === "login" ? (
        <LoginForm onSwitchToSignup={() => setMode("signup")} />
      ) : mode === "signup" ? (
        <SignupForm onSwitchToLogin={() => setMode("login")} />
      ) : null}
    </div>
  );
}

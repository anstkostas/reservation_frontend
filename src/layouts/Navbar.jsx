// src/layouts/Navbar.jsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks";

export default function Navbar() {
  const { currentUser, logout, isLoggingOut } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <nav className="flex justify-between items-center p-4 border-b">
      {/* Left side: site logo / name */}
      <div>
        <Link to="/dashboard" className="font-bold text-lg">
          MyApp
        </Link>
      </div>

      {/* Right side: navigation links & auth controls */}
      <div className="flex items-center gap-4">
        {/* Navigation links */}

        {!currentUser ? (
          !isLoginPage && <Link to="/login">Login</Link>
        ) : (
          <>
            <span>{currentUser.firstname}</span> {/* Add icon */}
            <button
              onClick={logout}
              disabled={isLoggingOut}
              className="text-red-600"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

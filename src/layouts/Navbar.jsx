import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { FaUser } from "react-icons/fa";
import { HiOutlineLogin } from "react-icons/hi";
import { MdLogout } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Navbar() {
  const { currentUser, logout, isLoggingOut, isLoadingUser } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <nav className="flex justify-between items-center p-4 border-b">
      {/* Left side: site logo / name */}
      <div className="flex items-center gap-4">
        {isLoadingUser ? (
          <AiOutlineLoading3Quarters className="animate-spin w-5 h-5 text-gray-600" />
        ) : !currentUser && !isLoginPage ? (
          <Link to="/login" className="flex items-center gap-1">
            <HiOutlineLogin className="w-5 h-5" /> Login
          </Link>
        ) : currentUser ? (
          <>
            <span className="flex items-center gap-1">
              {currentUser.firstname} <FaUser className="w-5 h-5" />
            </span>
            <button
              onClick={logout}
              disabled={isLoggingOut}
              className="flex items-center gap-1 text-red-600"
            >
              {isLoggingOut ? (
                <AiOutlineLoading3Quarters className="animate-spin w-5 h-5" />
              ) : (
                <MdLogout className="w-5 h-5" />
              )}
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
}

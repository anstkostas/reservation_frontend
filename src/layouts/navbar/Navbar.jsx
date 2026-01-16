import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { Button } from "@/components/ui/button";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { UtensilsCrossed } from "lucide-react";
import NavbarSheet from "./components/NavbarSheet";
import NavbarDropdownMenu from "./components/NavbarDropdownMenu";

export default function Navbar() {
  const { currentUser, logout, isLoggingOut, isLoadingUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 mx-auto items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <NavbarSheet />
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
              <span className="hidden md:block">
                <img src="/vite.svg" alt="Logo" className="h-6 w-6 inline mr-2" />
              </span>
            </Link>
          </div>


          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link
              to="/restaurants"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <UtensilsCrossed className="h-4 w-4" />
              Restaurants
            </Link>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-4">
              <NavbarDropdownMenu currentUser={currentUser} handleLogout={handleLogout} isLoggingOut={isLoggingOut} />
            </div>
          ) : !isLoginPage && (
            <div className="flex items-center gap-4">
              <Button asChild>
                <Link to="/login">Log in</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

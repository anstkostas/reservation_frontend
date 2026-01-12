import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetClose
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { LogOut, User, LayoutDashboard, CalendarDays, UtensilsCrossed, Menu, X } from "lucide-react";

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
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 mx-auto items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader className="flex flex-row items-center justify-between space-y-0">
                <SheetTitle className="text-left flex items-center gap-2">
                  <img src="/vite.svg" alt="Logo" className="h-6 w-6" />
                </SheetTitle>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </Button>
                </SheetClose>
                <SheetDescription className="sr-only">
                  Navigation menu
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <SheetClose asChild>
                  <Link
                    to="/restaurants"
                    className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors"
                  >
                    <UtensilsCrossed className="h-5 w-5" />
                    Restaurants
                  </Link>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>

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

        <div className="flex items-center gap-4">
          {isLoadingUser ? (
            <AiOutlineLoading3Quarters className="animate-spin w-5 h-5 text-muted-foreground" />
          ) : currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 hover:scale-105 transition-transform cursor-pointer border border-primary/20">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.firstname}`} alt={currentUser.firstname} />
                    <AvatarFallback>{currentUser.firstname?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.firstname} {currentUser.lastname}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                    <span className="text-[10px] uppercase font-bold text-primary mt-1">
                      {currentUser.role}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {currentUser.role === "owner" ? (
                  <DropdownMenuItem asChild>
                    <Link to="/owner-dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link to="/my-reservations" className="cursor-pointer">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      My Reservations
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="text-red-600 focus:text-red-600 cursor-pointer">
                  {isLoggingOut ? (
                    <AiOutlineLoading3Quarters className="animate-spin mr-2 h-4 w-4" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !isLoginPage ? (
            <Button asChild>
              <Link to="/login">Log in</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

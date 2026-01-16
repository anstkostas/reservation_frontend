import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { LogOut, LayoutDashboard, CalendarDays } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

export default function NavbarDropdownMenu({ currentUser, handleLogout, isLoggingOut }) {
  return (
    <>
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
    </>
  );
}
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X, UtensilsCrossed } from "lucide-react";

export default function NavbarSheet() {
  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden cursor-pointer">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader className="flex flex-row items-center justify-between space-y-0">
            <SheetTitle className="text-left flex items-center gap-2 cursor-pointer">
              <SheetClose asChild>
                <Link to="/">
                  <img src="/vite.svg" alt="Logo" className="h-6 w-6" />
                </Link>
              </SheetClose>
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="cursor-pointer">
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
    </>
  );
}
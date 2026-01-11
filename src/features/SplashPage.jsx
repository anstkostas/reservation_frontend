import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";

export default function SplashPage() {
  const { currentUser, isLoadingUser } = useAuth();
  const navigate = useNavigate();

  const handlePrimaryCTA = () => {
    if (currentUser) {
      if (currentUser.role === "owner") {
        navigate("/owner-dashboard");
      } else {
        navigate("/my-reservations");
      }
    } else {
      navigate("/restaurants");
    }
  };

  if (isLoadingUser) return null;

  return (
    <div className="relative flex-1 w-full flex flex-col items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1705211734796-7cdbcb527636?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHJlc2VydmF0aW9uJTIwYXBwJTIwaW4lMjBwaG9uZXxlbnwwfHwwfHx8MA%3D%3D')",
        }}
      >
        <div className="absolute inset-0 bg-black/60 bg-linear-to-t from-black/90 to-transparent" />
      </div>

      <div className="relative z-10 text-center space-y-8 p-6 max-w-2xl animate-in fade-in zoom-in duration-700">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-xl">
            <span className="text-secondary">Reservation App</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 font-light">
            Book, manage, and explore your favorite restaurants seamlessly.
          </p>
        </div>

        <Button
          onClick={handlePrimaryCTA}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-4 h-auto rounded-full font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          {currentUser
            ? (currentUser.role === "owner" ? "Dashboard" : "My Reservations")
            : "Explore Restaurants"
          }
        </Button>
      </div>
    </div>
  );
}

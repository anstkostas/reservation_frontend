import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRestaurant } from "../useRestaurants";
import { useAuth } from "@/features/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReservationCreateModal } from "@/features/reservations/components/ReservationCreateModal";

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { data: restaurant, isLoading, error } = useRestaurant(id);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleBookClick = () => {
    if (!currentUser) {
      navigate("/login", { state: { from: `/restaurants/${id}` } });
      return;
    }
    setIsBookingOpen(true);
  };

  if (isLoading)
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Loading restaurant details...</div>
      </div>
    );

  if (error || !restaurant)
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[50vh]">
        <div className="text-destructive">Error loading restaurant. Please try again later.</div>
      </div>
    );

  return (
    <div className="container mx-auto p-4 space-y-8 animate-in fade-in duration-500">
      <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-xl group">
        <img
          src={restaurant.coverImageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent flex items-end p-8">
          <div className="text-white space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{restaurant.name}</h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl font-light">
              {restaurant.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed">
                {restaurant.description} experience awaits you. Enjoy our carefully curated menu
                in a comfortable atmosphere.
              </p>
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="bg-secondary px-3 py-1 rounded-full flex items-center gap-2">
                  <span className="font-medium">Capacity:</span> {restaurant.capacity} Tables
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="border-primary/20 shadow-md">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold">Make a Reservation</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Secure your table for an unforgettable dining experience.
                </p>
              </div>
              <Button
                className="w-full text-lg py-6 cursor-pointer shadow-lg shadow-primary/20"
                size="lg"
                onClick={handleBookClick}
              >
                Book a Table
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ReservationCreateModal
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
      />
    </div>
  );
}

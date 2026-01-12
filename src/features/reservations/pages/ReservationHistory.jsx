import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useMyReservationsQuery } from "../queries";
import { ReservationCard } from "../components/ReservationCard";
import { ReservationDetailModal } from "../components/ReservationDetailModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarDays, History, UtensilsCrossed } from "lucide-react";

export default function ReservationHistory() {
  const { data: reservations, isLoading, error } = useMyReservationsQuery();
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading your reservations...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading reservations: {error.message}
      </div>
    );
  }

  const upcoming = reservations?.filter(r => r.status === 'active') || [];
  const history = reservations?.filter(r => r.status !== 'active') || [];

  // Sort upcoming by date ascending (soonest first)
  upcoming.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

  // Sort history by date descending (most recent first)
  history.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Reservations</h1>
          <p className="text-muted-foreground">View and manage your dining bookings.</p>
        </div>
        <Button asChild>
          <Link to="/restaurants">
            <UtensilsCrossed className="mr-2 h-4 w-4" />
            Book a Table
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8">
          <TabsTrigger value="upcoming">
            <CalendarDays className="mr-2 h-4 w-4" />
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            History ({history.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcoming.length === 0 ? (
            <EmptyState type="upcoming" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map(r => (
                <ReservationCard key={r.id} reservation={r} onClick={handleCardClick} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {history.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/50">
              <p className="text-muted-foreground">No past reservation history.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map(r => (
                <ReservationCard key={r.id} reservation={r} onClick={handleCardClick} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ReservationDetailModal
        reservation={selectedReservation}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}

function EmptyState({ type }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-muted/50">
      <div className="bg-background p-4 rounded-full mb-4 shadow-sm">
        <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No upcoming reservations</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        You don't have any active bookings at the moment. Explore our restaurants and book your next meal!
      </p>
      <Button asChild>
        <Link to="/restaurants">Find a Restaurant</Link>
      </Button>
    </div>
  );
}

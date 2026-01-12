import { format } from "date-fns";
import { CalendarIcon, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ReservationCard({ reservation, onClick }) {
  const statusColors = {
    active: "default", // primary
    completed: "secondary", // gray
    canceled: "destructive", // red
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary"
      onClick={() => onClick(reservation)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-lg line-clamp-1">
              {reservation.restaurantName || `Restaurant #${reservation.restaurantId}`}
            </CardTitle>
          </div>
          <Badge variant={statusColors[reservation.status] || "outline"} className="capitalize">
            {reservation.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span>
              {format(new Date(reservation.date), "EEE, MMM d")} • {reservation.time.slice(0, 5)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{reservation.persons} people</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

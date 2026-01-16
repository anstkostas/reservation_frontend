import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { ReservationStatusBadge } from "./ReservationStatusBadge";

export default function OwnerTableViewMobile({ activeReservations, canUpdate, handleResolve, resolveMutation, showActions }) {

  if (activeReservations.length === 0) {
    return (
      <>
        <div className="text-center p-8 border rounded-md text-muted-foreground bg-muted/10">
          No reservations found.
        </div>
      </>
    )
  }

  return activeReservations.map((activeReservation) => (
    <Card key={activeReservation.id} className="overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-lg">
              {activeReservation.customer?.firstname} {activeReservation.customer?.lastname}
            </div>
            <div className="text-sm text-muted-foreground">{activeReservation.customer?.email}</div>
          </div>
          <ReservationStatusBadge status={activeReservation.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium">{format(new Date(activeReservation.date), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium">{activeReservation.time}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 col-span-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-medium">{activeReservation.persons} People</span>
          </div>
        </div>

        {showActions && canUpdate(activeReservation.date, activeReservation.time) && (
          <div className="pt-2 flex flex-wrap justify-evenly gap-3">
            <Button
              variant="outline"
              className="w-[130px] text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
              onClick={() => handleResolve(activeReservation.id, 'completed')}
              disabled={resolveMutation.isPending}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete
            </Button>
            <Button
              variant="outline"
              className="w-[130px] text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              onClick={() => handleResolve(activeReservation.id, 'no-show')}
              disabled={resolveMutation.isPending}
            >
              <XCircle className="h-4 w-4" />
              No-show
            </Button>
          </div>
        )}
        {!canUpdate(activeReservation.date, activeReservation.time) && (
          <div className="text-center text-xs text-muted-foreground italic pt-2 border-t">
            Arriving soon
          </div>
        )}
      </CardContent>
    </Card>
  ))
}
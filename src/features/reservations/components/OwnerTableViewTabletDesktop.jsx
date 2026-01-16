import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { ReservationStatusBadge } from "./ReservationStatusBadge";

export default function OwnerTableViewTabletDesktop({ activeReservations, canUpdate, handleResolve, resolveMutation, showActions }) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>People</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeReservations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 5 : 4} className="h-24 text-center">
                No reservations found.
              </TableCell>
            </TableRow>
          ) : (
            activeReservations.map((activeReservation) => (
              <TableRow key={activeReservation.id}>
                <TableCell>
                  <div className="font-medium">
                    {activeReservation.customer?.firstname} {activeReservation.customer?.lastname}
                  </div>
                  <div className="text-sm text-muted-foreground">{activeReservation.customer?.email}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(activeReservation.date), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {activeReservation.time}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {activeReservation.persons}
                  </div>
                </TableCell>
                <TableCell>
                  <ReservationStatusBadge status={activeReservation.status} />
                </TableCell>
                <TableCell className="text-right">
                  {showActions && (canUpdate(activeReservation.date, activeReservation.time) ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        className="w-[130px] text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleResolve(activeReservation.id, 'completed')}
                        disabled={resolveMutation.isPending}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Complete
                      </Button>
                      <Button
                        variant="outline"
                        className="w-[130px] text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleResolve(activeReservation.id, 'no-show')}
                        disabled={resolveMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                        No-show
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Arriving soon</span>
                  ))}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  )
}
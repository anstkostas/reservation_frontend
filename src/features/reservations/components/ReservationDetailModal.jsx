import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { DateFormField, PersonsFormField, TimeFormField } from "@/components/FormFields";
import { useCancelReservationMutation, useUpdateReservationMutation } from "../queries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, Loader2, Users, MapPin, Phone } from "lucide-react";
import { formSchema } from "../schemas";

/**
 * Modal for the customer to view and manage an existing reservation.
 *
 * Logic:
 * - Dual Mode: View Mode (Display only) vs Edit Mode (Update details).
 * - State Management: Resets form state whenever the `reservation` prop changes or modal opens.
 * - Actions:
 *   - Cancel: Deletes the reservation (with confirmation).
 *   - Update: Mutates the existing reservation (optimistic update via React Query).
 * - Conditional UI: Displays different buttons based on `status` (e.g., active vs completed).
 *
 * @param {object} props
 * @param {object} props.reservation - The full reservation object to display.
 * @param {boolean} props.open - Modal visibility.
 * @param {function} props.onOpenChange - State setter.
 */
export function ReservationDetailModal({ reservation, open, onOpenChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const cancelMutation = useCancelReservationMutation();
  const updateMutation = useUpdateReservationMutation();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
      time: "",
      persons: 1,
    },
  });

  // Reset form and state when modal opens or reservation changes
  useEffect(() => {
    if (open && reservation) {
      setIsEditing(false);
      setIsCancelConfirmOpen(false);
      // Split scheduledAt into local date/time strings for the form pickers.
      // format() uses local time — do NOT use toISOString() which returns UTC.
      const scheduled = new Date(reservation.scheduledAt);
      form.reset({
        date: format(scheduled, "yyyy-MM-dd"),
        time: format(scheduled, "HH:mm"),
        persons: reservation.persons,
      });
      cancelMutation.reset();
      updateMutation.reset();
    }
  }, [open, reservation, form, cancelMutation.reset, updateMutation.reset]);

  if (!reservation) return null;

  const handleCancelReservation = () => {
    setIsCancelConfirmOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      const res = await cancelMutation.mutateAsync(reservation.id);
      toast.success(res.message || "Reservation canceled successfully");
      onOpenChange(false);
    } catch (err) {
      toast.error(err.message || "Failed to cancel reservation");
    }
  };

  const onSubmit = async (values) => {
    try {
      // Combine separate date/time pickers into a single ISO datetime for the API
      const scheduledAt = new Date(`${values.date}T${values.time}`).toISOString();
      const res = await updateMutation.mutateAsync({
        id: reservation.id,
        scheduledAt,
        persons: values.persons,
      });
      toast.success(res.message || "Reservation updated successfully");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || "Failed to update reservation");
      console.error("[LOG] ReservationDetailModal.onSubmit:", err.stack);
    }
  };

  const statusColors = {
    active: "default",
    completed: "secondary",
    canceled: "destructive",
  };

  return (
    <>
      <AlertDialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this reservation? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={cancelMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex justify-between items-center pr-4">
              <DialogTitle>Reservation Details</DialogTitle>
              <Badge variant={statusColors[reservation.status]} className="capitalize">
                {reservation.status}
              </Badge>
            </div>
            <DialogDescription>
              at{" "}
              <span className="font-semibold text-foreground">
                {reservation.restaurantName || `Restaurant #${reservation.restaurantId}`}
              </span>
              <span className="block mt-1 text-xs">ID: {reservation.id}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isEditing ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  id="edit-reservation-form"
                  className="space-y-4"
                >
                  <DateFormField control={form.control} />
                  <TimeFormField control={form.control} />
                  <PersonsFormField control={form.control} />
                </form>
              </Form>
            ) : (
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <span className="text-lg font-medium">
                    {reservation.scheduledAt
                      ? format(new Date(reservation.scheduledAt), "EEEE, MMMM d, yyyy")
                      : "Date not available"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-lg">
                    {reservation.scheduledAt
                      ? format(new Date(reservation.scheduledAt), "HH:mm")
                      : "Time not available"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-lg">{reservation.persons} people</span>
                </div>
                {reservation.restaurantAddress && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="text-lg">{reservation.restaurantAddress}</span>
                  </div>
                )}
                {reservation.restaurantPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <span className="text-lg">{reservation.restaurantPhone}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {reservation.status === "active" &&
              (isEditing ? (
                <>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={updateMutation.isPending}
                  >
                    Cancel Edit
                  </Button>
                  <Button
                    type="submit"
                    form="edit-reservation-form"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Reservation
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto"
                    onClick={handleCancelReservation}
                    disabled={cancelMutation.isPending}
                  >
                    {cancelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cancel Reservation
                  </Button>
                </>
              ))}
            {reservation.status !== "active" && (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

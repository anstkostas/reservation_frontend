import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateReservationMutation } from "../queries";
import { formSchema } from "../schemas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { DateFormField } from "@/components/FormFields";
import { TimeFormField } from "@/components/FormFields";
import { PersonsFormField } from "@/components/FormFields";

/**
 * Modal for the customer to make a new reservation.
 *
 * Logic:
 * - Uses `useCreateReservationMutation` to optimistically create the booking.
 * - Validates date/time/people via Zod schema before submission.
 * - Handles toast notifications for success/failure feedback.
 *
 * @param {object} props
 * @param {string} props.restaurantId - The target restaurant ID.
 * @param {string} props.restaurantName - Display name for the modal header.
 * @param {boolean} props.open - Modal visibility state.
 * @param {function} props.onOpenChange - State setter for visibility.
 */
export function ReservationCreateModal({ restaurantId, restaurantName, open, onOpenChange }) {
  const createMutation = useCreateReservationMutation();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      time: "19:00",
      people: 2,
    },
  });

  const onSubmit = async (data) => {
    try {
      // Combine separate date/time pickers into a single ISO datetime for the API
      const scheduledAtDate = new Date(`${data.date}T${data.time}`);
      const res = await createMutation.mutateAsync({
        restaurantId,
        scheduledAt: scheduledAtDate.toISOString(),
        people: data.people,
      });
      if (res.success) {
        toast.success(res.message || `Table booked at ${restaurantName}!`, {
          description: `${format(scheduledAtDate, "EEE, MMM d")} at ${format(scheduledAtDate, "HH:mm")}`,
        });
        onOpenChange(false);
        form.reset();
      } else {
        toast.error(res.message || "Failed to book table");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Book a Table</DialogTitle>
          <DialogDescription>
            at <span className="font-semibold text-foreground">{restaurantName}</span>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DateFormField control={form.control} />
            <TimeFormField control={form.control} />
            <PersonsFormField control={form.control} />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Booking
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

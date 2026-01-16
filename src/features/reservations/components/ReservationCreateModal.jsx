import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays } from "date-fns";
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
 * Modal for creating a new reservation.
 * 
 * Logic:
 * - Multi-step process (currently single form step).
 * - Uses `useCreateReservationMutation` to optimistically create the booking.
 * - Validates date/time/persons via Zod schema before submission.
 * - Handles toast notifications for success/failure feedback.
 * 
 * @param {object} props
 * @param {string} props.restaurantId - The target restaurant ID.
 * @param {string} props.restaurantName - Display name for the modal header.
 * @param {boolean} props.open - Modal visibility state.
 * @param {function} props.onOpenChange - State setter for visibility.
 */
export function ReservationCreateModal({ restaurantId, restaurantName, open, onOpenChange }) {
  const [step, setStep] = useState(1); // 1 = Form, 2 = Success (optional, or just close)
  const createMutation = useCreateReservationMutation();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      time: "19:00",
      persons: 2,
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate(
      { restaurantId, ...data },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success(res.message || `Table booked at ${restaurantName}!`, {
              description: `${format(new Date(data.date), 'EEE, MMM d')} at ${data.time}`
            });
            onOpenChange(false);
            form.reset();
          } else {
            toast.error(res.message || "Failed to book table");
          }
        },
        onError: (err) => {
          toast.error(err.message || "Something went wrong. Please try again.");
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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

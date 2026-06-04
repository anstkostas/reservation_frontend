import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { formSchema, type ReservationFormValues } from "../schemas";
import type { ApiError, Reservation, ReservationStatus } from "@/types/api";
import { resolveErrorMessage } from "@/lib/apiError";

/** Maps every reservation status to a Shadcn Badge variant. */
const STATUS_BADGE_VARIANT = {
  active: "default",
  completed: "secondary",
  canceled: "destructive",
  "no-show": "outline",
} as const satisfies Record<ReservationStatus, string>;

const STATUS_KEY_MAP = {
  active: "statusActive",
  completed: "statusCompleted",
  canceled: "statusCanceled",
  "no-show": "statusNoShow",
} as const satisfies Record<ReservationStatus, string>;

interface Props {
  reservation: Reservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
 */
export function ReservationDetailModal({ reservation, open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const cancelMutation = useCancelReservationMutation();
  const updateMutation = useUpdateReservationMutation();

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
      time: "",
      people: 1,
    },
  });

  // Destructure stable method refs — useForm and useMutation may recreate their return
  // objects on state changes, but individual method refs are stable, so we use these
  // in deps instead of the full objects to avoid spurious effect re-runs
  const { reset: formReset } = form;
  const { reset: cancelMutationReset } = cancelMutation;
  const { reset: updateMutationReset } = updateMutation;

  // Reset form values when modal opens or reservation changes.
  // State resets (isEditing, isCancelConfirmOpen) are handled in handleOpenChange on close.
  useEffect(() => {
    if (open && reservation) {
      // Split scheduledAt into local date/time strings for the form pickers.
      // format() uses local time — do NOT use toISOString() which returns UTC.
      const scheduled = new Date(reservation.scheduledAt);
      formReset({
        date: format(scheduled, "yyyy-MM-dd"),
        time: format(scheduled, "HH:mm"),
        people: reservation.people,
      });
      cancelMutationReset();
      updateMutationReset();
    }
  }, [open, reservation, formReset, cancelMutationReset, updateMutationReset]);

  // Reset UI state on close so the modal opens fresh next time
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsEditing(false);
      setIsCancelConfirmOpen(false);
    }
    onOpenChange(newOpen);
  };

  if (!reservation) return null;

  const handleCancelReservation = () => {
    setIsCancelConfirmOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      const res = await cancelMutation.mutateAsync(reservation.id);
      toast.success(res.message || t("reservationCanceledSnackbar"));
      onOpenChange(false);
    } catch (err) {
      toast.error(resolveErrorMessage(t, err as ApiError));
    }
  };

  const onSubmit = async (values: ReservationFormValues) => {
    try {
      // Combine separate date/time pickers into a single ISO datetime for the API
      const scheduledAt = new Date(`${values.date}T${values.time}`).toISOString();
      const res = await updateMutation.mutateAsync({
        id: reservation.id,
        scheduledAt,
        people: values.people,
      });
      toast.success(res.message || t("reservationUpdatedSnackbar"));
      setIsEditing(false);
    } catch (err) {
      toast.error(resolveErrorMessage(t, err as ApiError));
      console.error("[LOG] ReservationDetailModal.onSubmit:", err instanceof Error ? err.stack : String(err));
    }
  };

  return (
    <>
      <AlertDialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("reservationCancelDialogTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("reservationCancelDialogContent")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("reservationCancelDialogKeep")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={cancelMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("reservationCancelDialogConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <div className="flex justify-between items-center pr-4">
              <DialogTitle>{t("reservationDetailModalTitle")}</DialogTitle>
              <Badge variant={STATUS_BADGE_VARIANT[reservation.status]}>
                {t(STATUS_KEY_MAP[reservation.status])}
              </Badge>
            </div>
            <DialogDescription>
              at{" "}
              <span className="font-semibold text-foreground">
                {reservation.restaurantName || `${t("reservationDetailRestaurantFallback")} #${reservation.restaurantId}`}
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
                  <span className="text-lg">{t(reservation.people === 1 ? "reservationDetailGuestSingular" : "reservationDetailGuestPlural", { count: reservation.people })}</span>
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
                    {t("reservationEditDiscardButton")}
                  </Button>
                  <Button
                    type="submit"
                    form="edit-reservation-form"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("reservationEditSaveButton")}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => setIsEditing(true)}
                  >
                    {t("reservationDetailEditButton")}
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto"
                    onClick={handleCancelReservation}
                    disabled={cancelMutation.isPending}
                  >
                    {cancelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("reservationDetailCancelButton")}
                  </Button>
                </>
              ))}
            {reservation.status !== "active" && (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("closeButton")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

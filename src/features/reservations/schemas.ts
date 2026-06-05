import * as z from "zod";

type TranslateFunction = (key: string, options?: Record<string, unknown>) => string;
import {
  RESERVATION_MIN_BUFFER_MINUTES,
  RESERVATION_BOOKING_WINDOW_MONTHS,
} from "@/constants";

/**
 * Returns the Zod schema for the reservation form with localized validation messages.
 * Enforces the booking buffer and booking window constraints via `.refine()`.
 *
 * @param {TranslateFunction} t - i18next translate function from `useTranslation()`
 * @returns {ZodEffects} Reservation form schema
 */
export function createReservationSchema(t: TranslateFunction) {
  return z
    .object({
      date: z.string().min(1, t("validatorFieldRequired", { fieldName: t("reservationCreateDateLabel") })),
      time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, t("validatorTimeInvalid")),
      people: z
        .number({ error: t("validatorGuestsInvalidNumber") })
        .int(t("validatorGuestsMustBeInteger"))
        .min(1, t("validatorGuestsTooFew"))
        .max(20, t("validatorGuestsTooMany")),
    })
    .refine(
      (data) => {
        const scheduledAt = new Date(`${data.date}T${data.time}`);
        const minTime = new Date(Date.now() + RESERVATION_MIN_BUFFER_MINUTES * 60 * 1000);
        return scheduledAt >= minTime;
      },
      {
        message: t("validatorReservationTooSoon", { minutes: RESERVATION_MIN_BUFFER_MINUTES }),
        path: ["time"],
      }
    )
    .refine(
      (data) => {
        const scheduledAt = new Date(`${data.date}T${data.time}`);
        const maxTime = new Date();
        maxTime.setMonth(maxTime.getMonth() + RESERVATION_BOOKING_WINDOW_MONTHS);
        return scheduledAt <= maxTime;
      },
      {
        message: t("validatorReservationTooFar", { months: RESERVATION_BOOKING_WINDOW_MONTHS }),
        path: ["date"],
      }
    );
}

export type ReservationFormValues = z.infer<ReturnType<typeof createReservationSchema>>;

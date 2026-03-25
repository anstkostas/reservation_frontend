import * as z from "zod";
import {
  RESERVATION_MIN_BUFFER_MINUTES,
  RESERVATION_BOOKING_WINDOW_MONTHS,
} from "@/lib/constants";

export const formSchema = z
  .object({
    date: z.string().min(1, "Date is required"),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be HH:MM"),
    persons: z.coerce.number().min(1, "At least 1 person").max(20, "Max 20 people"),
  })
  .refine(
    (data) => {
      const scheduledAt = new Date(`${data.date}T${data.time}`);
      const minTime = new Date(Date.now() + RESERVATION_MIN_BUFFER_MINUTES * 60 * 1000);
      return scheduledAt >= minTime;
    },
    {
      message: `Reservation must be at least ${RESERVATION_MIN_BUFFER_MINUTES} minutes from now`,
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
      message: `Reservation must be within ${RESERVATION_BOOKING_WINDOW_MONTHS} months from today`,
      path: ["date"],
    }
  );

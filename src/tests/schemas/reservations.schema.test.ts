import { addMinutes, addMonths, format } from "date-fns";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { TFunction } from "i18next";
import { createReservationSchema } from "@/features/reservations/schemas";
import {
  RESERVATION_BOOKING_WINDOW_MONTHS,
  RESERVATION_MIN_BUFFER_MINUTES,
} from "@/constants";

// Minimal mock — returns English strings for the keys used in the schema
const t = ((key: string, opts?: Record<string, unknown>): string => {
  const translations: Record<string, string> = {
    "validatorFieldRequired": `${opts?.fieldName} is required`,
    "reservationCreateDateLabel": "Date",
    "validatorTimeInvalid": "Invalid time format",
    "validatorGuestsInvalidNumber": "Enter a valid number",
    "validatorGuestsMustBeInteger": "Must be a whole number",
    "validatorGuestsTooFew": "Must be at least 1 guest",
    "validatorGuestsTooMany": "Cannot exceed 20 guests",
    "validatorReservationTooSoon": `Reservation must be at least ${opts?.minutes} minutes from now`,
    "validatorReservationTooFar": `Reservation must be within ${opts?.months} months from today`,
  };
  return translations[key] ?? key;
}) as unknown as TFunction;

const formSchema = createReservationSchema(t);

describe("reservation form schema", () => {
  const fixedNow = new Date("2026-04-26T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fails when date is empty", () => {
    const result = formSchema.safeParse({
      date: "",
      time: "19:00",
      people: 2,
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.date).toContain("Date is required");
  });

  it("fails when time is not in HH:MM format", () => {
    const result = formSchema.safeParse({
      date: "2026-04-27",
      time: "7pm",
      people: 2,
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.time).toContain("Invalid time format");
  });

  it("fails when people count is below 1", () => {
    const result = formSchema.safeParse({
      date: "2026-04-27",
      time: "19:00",
      people: 0,
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.people).toContain("Must be at least 1 guest");
  });

  it("fails when reservation is earlier than the minimum buffer", () => {
    const tooSoon = addMinutes(fixedNow, RESERVATION_MIN_BUFFER_MINUTES - 5);

    const result = formSchema.safeParse({
      date: format(tooSoon, "yyyy-MM-dd"),
      time: format(tooSoon, "HH:mm"),
      people: 2,
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.time).toContain(
      `Reservation must be at least ${RESERVATION_MIN_BUFFER_MINUTES} minutes from now`
    );
  });

  it("fails when reservation is beyond the booking window", () => {
    const tooFar = addMonths(fixedNow, RESERVATION_BOOKING_WINDOW_MONTHS + 1);

    const result = formSchema.safeParse({
      date: format(tooFar, "yyyy-MM-dd"),
      time: "19:00",
      people: 2,
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.date).toContain(
      `Reservation must be within ${RESERVATION_BOOKING_WINDOW_MONTHS} months from today`
    );
  });
});

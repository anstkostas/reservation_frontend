/**
 * Unit tests for createReservationSchema — date, time, guests, and booking window validation.
 * Type: unit (pure Zod validation via .safeParse(), fake timers for date boundary tests).
 *
 * Covers: passes for a valid payload; fails when date is empty; fails when time is not HH:MM;
 *   fails when guests < 1; fails when reservation is within the minimum buffer window;
 *   fails when reservation exceeds the booking window.
 * Not yet covered: guests above maximum (20); time field empty/missing; exactly at the minimum
 *   buffer boundary (edge — should pass); exactly at the max booking window boundary (edge — should pass).
 * Oracle: DOMAIN.md §Booking constraints — 30-minute minimum lead time, 2-month maximum booking
 *   window. Boundary inputs and assertion messages use these hardcoded values (not the project
 *   constants) so a wrong constant value causes a test failure rather than a silent pass.
 */

import { addMinutes, addMonths, format } from "date-fns";
import { vi } from "vitest";
import { z } from "zod";
import type { TFunction } from "i18next";
import { createReservationSchema } from "@/features/reservations/schemas";

// Minimum lead time and booking window per DOMAIN.md §Booking constraints.
const MIN_BUFFER_MINUTES = 30;
const MAX_BOOKING_WINDOW_MONTHS = 2;

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

  it("passes for a valid date, time, and guests count", () => {
    // 150 minutes ahead: comfortably past the 30-minute minimum (DOMAIN.md)
    const validDate = addMinutes(fixedNow, 150);
    const result = formSchema.safeParse({
      date: format(validDate, "yyyy-MM-dd"),
      time: format(validDate, "HH:mm"),
      people: 2,
    });

    expect(result.success).toBe(true);
  });

  it("fails when date is empty", () => {
    const result = formSchema.safeParse({
      date: "",
      time: "19:00",
      people: 2,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.date).toContain("Date is required");
    }
  });

  it("fails when time is not in HH:MM format", () => {
    const result = formSchema.safeParse({
      date: "2026-04-27",
      time: "7pm",
      people: 2,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.time).toContain("Invalid time format");
    }
  });

  it("fails when people count is below 1", () => {
    const result = formSchema.safeParse({
      date: "2026-04-27",
      time: "19:00",
      people: 0,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.people).toContain("Must be at least 1 guest");
    }
  });

  it("fails when reservation is earlier than the minimum buffer", () => {
    // 25 minutes ahead — below the 30-minute minimum (DOMAIN.md)
    const tooSoon = addMinutes(fixedNow, MIN_BUFFER_MINUTES - 5);

    const result = formSchema.safeParse({
      date: format(tooSoon, "yyyy-MM-dd"),
      time: format(tooSoon, "HH:mm"),
      people: 2,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.time).toContain(
        `Reservation must be at least ${MIN_BUFFER_MINUTES} minutes from now`
      );
    }
  });

  it("fails when reservation is beyond the booking window", () => {
    // 3 months ahead — beyond the 2-month maximum (DOMAIN.md)
    const tooFar = addMonths(fixedNow, MAX_BOOKING_WINDOW_MONTHS + 1);

    const result = formSchema.safeParse({
      date: format(tooFar, "yyyy-MM-dd"),
      time: "19:00",
      people: 2,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(z.flattenError(result.error).fieldErrors.date).toContain(
        `Reservation must be within ${MAX_BOOKING_WINDOW_MONTHS} months from today`
      );
    }
  });
});

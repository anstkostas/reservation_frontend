import type { ReservationStatus } from "@/types/api";

/** Minimum lead time (in minutes) required before a reservation's scheduled time. */
export const RESERVATION_MIN_BUFFER_MINUTES = 30;

/** Maximum number of months in advance a reservation can be booked. */
export const RESERVATION_BOOKING_WINDOW_MONTHS = 2;

/** Canonical reservation status values used across the React app. */
export const RESERVATION_STATUSES = [
  "active",
  "canceled",
  "completed",
  "no-show",
] as const satisfies readonly ReservationStatus[];

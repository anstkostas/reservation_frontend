/**
 * User role values as used by the backend API.
 * Mirrors the Role enum in the Prisma schema on the backend.
 */
export enum Role {
  CUSTOMER = "customer",
  OWNER = "owner",
}

/** Minimum lead time (in minutes) required before a reservation's scheduled time. */
export const RESERVATION_MIN_BUFFER_MINUTES = 30;

/** Maximum number of months in advance a reservation can be booked. */
export const RESERVATION_BOOKING_WINDOW_MONTHS = 2;

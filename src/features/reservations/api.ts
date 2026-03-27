import { apiFetch } from "@/lib/fetch";
import type { ApiResponse, Reservation, ReservationStatus } from "@/types/api";

/** Payload for creating a new reservation. */
interface CreateReservationPayload {
  scheduledAt: string;
  people: number;
}

/** Payload for updating an existing reservation — all fields optional (partial update). */
interface UpdateReservationPayload {
  scheduledAt?: string;
  people?: number;
}

/**
 * Fetches the authenticated customer's reservation history.
 *
 * Logic:
 * - Secure endpoint (requires cookie).
 * - Returns all active, completed, and canceled reservations for the user.
 *
 * @returns {Promise<ApiResponse<Reservation[]>>} List of reservations.
 */
export function getMyReservations(): Promise<ApiResponse<Reservation[]>> {
  return apiFetch<ApiResponse<Reservation[]>>("/reservations/my-reservations");
}

/**
 * Cancels an active reservation.
 *
 * Logic:
 * - Soft delete, status update to 'canceled'.
 * - Only the customer who made the reservation can cancel it.
 *
 * @param {string} id - Reservation ID.
 * @returns {Promise<ApiResponse<null>>}
 */
export function cancelReservation(id: string): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(`/reservations/${id}`, { method: "DELETE" });
}

/**
 * Modifies an existing reservation.
 *
 * Logic:
 * - Updates scheduledAt or party size.
 * - Triggers backend validation (availability check, 4-hour conflict rule).
 * - Only the customer who made the reservation can update this info.
 *
 * @param {string} id - Reservation ID.
 * @param {UpdateReservationPayload} data - Fields to update.
 * @returns {Promise<ApiResponse<Reservation>>} Updated reservation.
 */
export function updateReservation(id: string, data: UpdateReservationPayload): Promise<ApiResponse<Reservation>> {
  return apiFetch<ApiResponse<Reservation>>(`/reservations/${id}`, {
    method: "PUT",
    body: data,
  });
}

/**
 * Creates a new reservation at a specific restaurant.
 *
 * Logic:
 * - Transactional creation.
 * - Checks availability and per-customer 4-hour conflict rule before confirming.
 * - Availability is 1 reservation -> 1 table removed from restaurant's remaining tables.
 *
 * @param {string} restaurantId - Target restaurant.
 * @param {CreateReservationPayload} data - Reservation details.
 * @returns {Promise<ApiResponse<Reservation>>} New reservation details.
 */
export function createReservation(restaurantId: string, data: CreateReservationPayload): Promise<ApiResponse<Reservation>> {
  return apiFetch<ApiResponse<Reservation>>(`/reservations/restaurants/${restaurantId}`, {
    method: "POST",
    body: data,
  });
}

/**
 * Fetches all reservations for the owner's restaurant.
 *
 * Logic:
 * - Owner-only endpoint.
 * - Used in the Owner Dashboard.
 *
 * @returns {Promise<ApiResponse<Reservation[]>>} List of reservations.
 */
export function getOwnerReservations(): Promise<ApiResponse<Reservation[]>> {
  return apiFetch<ApiResponse<Reservation[]>>("/reservations/owner-reservations");
}

/**
 * Updates the status of a reservation (Resolve/Decline).
 *
 * Logic:
 * - Restaurant owner's action to mark a reservation as 'completed' or 'no-show'.
 *
 * @param {string} id - Reservation ID.
 * @param {ReservationStatus} status - New status.
 * @returns {Promise<ApiResponse<Reservation>>} Updated reservation info.
 */
export function resolveReservation(id: string, status: ReservationStatus): Promise<ApiResponse<Reservation>> {
  return apiFetch<ApiResponse<Reservation>>(`/reservations/${id}/resolve`, {
    method: "POST",
    body: { status },
  });
}

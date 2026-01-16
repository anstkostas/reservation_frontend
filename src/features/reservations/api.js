import { apiFetch } from '@/lib/fetch';

/**
 * Fetches the authenticated customer's reservation history.
 * 
 * Logic:
 * - Secure endpoint (requires cookie).
 * - Returns all active, completed, and canceled reservations for the user.
 * 
 * @returns {Promise<Array>} List of reservations.
 */
export function getMyReservations() {
  return apiFetch('/reservations/my-reservations');
}

/**
 * Cancels an active reservation.
 * 
 * Logic:
 * - Soft delete, status update to 'canceled'.
 * - Only the customer who made the reservation can cancel it.
 * 
 * @param {string} id - Reservation ID.
 * @returns {Promise<void>}
 */
export function cancelReservation(id) {
  return apiFetch(`/reservations/${id}`, { method: 'DELETE' });
}

/**
 * Modifies an existing reservation.
 * 
 * Logic:
 * - Updates date, time, or party size.
 * - Triggers backend validation (availability check).
 * - Only the customer who made the reservation can update this info.
 * 
 * @param {string} id - Reservation ID.
 * @param {object} data - { date, time, persons }
 * @returns {Promise<object>} Updated reservation.
 */
export function updateReservation(id, data) {
  return apiFetch(`/reservations/${id}`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * Creates a new reservation at a specific restaurant.
 * 
 * Logic:
 * - transactional creation.
 * - Checks availability before confirming.
 * - Availability is 1 reservation -> 1 table removed from restaurant's remaining tables.
 * 
 * @param {string} restaurantId - Target restaurant.
 * @param {object} data - { date, time, persons }
 * @returns {Promise<object>} New reservation details.
 */
export function createReservation(restaurantId, data) {
  return apiFetch(`/reservations/restaurants/${restaurantId}`, {
    method: 'POST',
    body: data,
  });
}

/**
 * Fetches reservations all reservations for the owner's restaurant.
 * 
 * Logic:
 * - Owner-only endpoint.
 * - Used in the Owner Dashboard.
 * 
 * @returns {Promise<Array>} List of reservations.
 */
export function getOwnerReservations() {
  return apiFetch('/reservations/owner-reservations');
}

/**
 * Updates the status of a reservation (Resolve/Decline).
 * 
 * Logic:
 * - Restaurant owner's action to mark a reservation as 'completed' or 'no-show'.
 * 
 * @param {string} id - Reservation ID.
 * @param {string} status - New status.
 * @returns {Promise<object>} Updated reservation info.
 */
export function resolveReservation(id, status) {
  return apiFetch(`/reservations/${id}/resolve`, {
    method: 'POST',
    body: { status },
  });
}

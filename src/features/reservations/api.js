import { apiFetch } from '@/lib/fetch';

export function getMyReservations() {
  return apiFetch('/reservations/my-reservations');
}

export function cancelReservation(id) {
  return apiFetch(`/reservations/${id}`, { method: 'DELETE' });
}

export function updateReservation(id, data) {
  return apiFetch(`/reservations/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export function createReservation(restaurantId, data) {
  return apiFetch(`/reservations/restaurants/${restaurantId}`, {
    method: 'POST',
    body: data,
  });
}

export function getOwnerReservations() {
  return apiFetch('/reservations/owner-reservations');
}

export function resolveReservation(id, status) {
  return apiFetch(`/reservations/${id}/resolve`, {
    method: 'POST',
    body: { status },
  });
}

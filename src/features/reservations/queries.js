import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyReservations, cancelReservation, updateReservation, createReservation, getOwnerReservations, resolveReservation } from "./api";

/**
 * Hook to fetch the logged-in user's reservations.
 * Uses React Query to cache and manage the reservation list.
 * 
 * The query result containing the list of reservations.
 */
export function useMyReservationsQuery() {
  return useQuery({
    queryKey: ["my-reservations"],
    queryFn: getMyReservations,
    select: (res) => res.data,
  });
}

/**
 * Mutation to cancel a reservation.
 * 
 * Logic:
 * - On Success: Invalidates `['my-reservations']` to remove the canceled item without a full page reload.
 */
export function useCancelReservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelReservation,
    onSuccess: () => {
      // Invalidate the list to refetch updated status
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
    },
  });
}

/**
 * Mutation to update reservation details.
 * 
 * Logic:
 * - Expects an object `{ id, ...data }`.
 * - On Success: Invalidates `['my-reservations']` to reflect new time/date.
 */
export function useUpdateReservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => updateReservation(id, data), // Expects object { id, date, time, persons }
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
    },
  });
}

/**
 * Mutation to create a new reservation.
 * 
 * Logic:
 * - Expects `{ restaurantId, ...data }`.
 * - On Success: Invalidates `['my-reservations']` so the new booking immediately appears in the customer's list.
 * 
 * @returns {UseMutationResult}
 */
export function useCreateReservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ restaurantId, ...data }) => createReservation(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
    },
  });
}

/**
 * Query for owners to see bookings at their venue.
 * 
 * Logic:
 * - Query Key: `['owner-reservations']`
 * - Used in Owner Dashboard.
 * 
 * @returns {UseQueryResult<Array>}
 */
export function useOwnerReservationsQuery() {
  return useQuery({
    queryKey: ["owner-reservations"],
    queryFn: getOwnerReservations,
    select: (res) => res.data,
  });
}

/**
 * Mutation for owners to resolve (complete/cancel) a reservation.
 * 
 * Logic:
 * - On Success: Invalidates `['owner-reservations']` to update the list UI.
 * 
 * @returns {UseMutationResult}
 */
export function useResolveReservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => resolveReservation(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-reservations"] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyReservations, cancelReservation, updateReservation, createReservation, getOwnerReservations, completeReservation } from "./api";

export function useMyReservationsQuery() {
  return useQuery({
    queryKey: ["my-reservations"],
    queryFn: getMyReservations,
    select: (res) => res.data,
  });
}

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

export function useUpdateReservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => updateReservation(id, data), // Expects object { id, date, time, persons }
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
    },
  });
}

export function useCreateReservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ restaurantId, ...data }) => createReservation(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
    },
  });
}

export function useOwnerReservationsQuery() {
  return useQuery({
    queryKey: ["owner-reservations"],
    queryFn: getOwnerReservations,
    select: (res) => res.data,
  });
}

export function useCompleteReservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-reservations"] });
    },
  });
}

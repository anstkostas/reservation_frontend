import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../lib/fetch";

export function useMyReservations() {
  return useQuery({
    queryKey: ["my-reservations"],
    queryFn: async () => {
      const { data } = await apiFetch("/reservations/my-reservations");
      return data;
    },
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ restaurantId, ...data }) => {
      return apiFetch(`/reservations/restaurants/${restaurantId}`, {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["my-reservations"]);
    },
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      return apiFetch(`/reservations/${id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["my-reservations"]);
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      return apiFetch(`/reservations/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["my-reservations"]);
    },
  });
}

// --- Owner Hooks ---

export function useOwnerReservations() {
  return useQuery({
    queryKey: ["owner-reservations"],
    queryFn: async () => {
      // The backend returns the array directly in data field based on controller
      const { data } = await apiFetch("/reservations/owner/reservations");
      return data;
    },
  });
}

export function useCompleteReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      return apiFetch(`/reservations/${id}/complete`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["owner-reservations"]);
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../lib/fetch";

export function useRestaurants() {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: () => apiFetch("/restaurants"),
    select: (res) => res.data,
  });
}

export function useRestaurant(id) {
  return useQuery({
    queryKey: ["restaurants", id],
    queryFn: () => apiFetch(`/restaurants/${id}`),
    enabled: !!id,
    select: (res) => res.data,
  });
}

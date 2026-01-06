import { useQuery } from "@tanstack/react-query";
import { getUnownedRestaurants } from "./api";

/**
 * Fetch unowned restaurants
 * Query is disabled by default and enabled explicitly by the caller
 */
export function useUnownedRestaurantsQuery({ enabled }) {
  return useQuery({
    queryKey: ["/unowned-restaurants"],
    queryFn: getUnownedRestaurants,
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

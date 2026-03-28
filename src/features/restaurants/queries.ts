import { useQuery } from "@tanstack/react-query";
import { getUnownedRestaurants, getRestaurants, getRestaurant } from "./api";
import type { ApiError, ApiResponse, Restaurant } from "@/types/api";

/**
 * Query to fetch unowned restaurants. Used in the SignupForm.
 *
 * Logic:
 * - Query Key: `['unowned-restaurants']`
 * - Enabled Status: Managed by the SignupForm's checkbox.
 * - Stale Time: 5 minutes.
 * - Selection: Returns `res.data`.
 *
 * @param {{ enabled: boolean }} params
 * @returns {UseQueryResult<Restaurant[]>}
 */
export function useUnownedRestaurantsQuery({ enabled }: { enabled: boolean }) {
  return useQuery<ApiResponse<Restaurant[]>, ApiError, Restaurant[]>({
    queryKey: ["unowned-restaurants"],
    queryFn: getUnownedRestaurants,
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: false,
    select: (res) => res.data,
  });
}

/**
 * Query to fetch all restaurants for the listing page.
 *
 * Logic:
 * - Query Key: `['restaurants']`
 * - Standard fetch with default caching.
 *
 * @returns {UseQueryResult<Restaurant[]>} List of restaurants.
 */
export function useRestaurants() {
  return useQuery<ApiResponse<Restaurant[]>, ApiError, Restaurant[]>({
    queryKey: ["restaurants"],
    queryFn: getRestaurants,
    select: (res) => res.data,
  });
}

/**
 * Query to fetch a single restaurant by ID.
 *
 * Logic:
 * - Query Key: `['restaurants', id]`
 * - Enabled: Only runs if `id` is truthy.
 *
 * @param {string} id - Restaurant UUID.
 * @returns {UseQueryResult<Restaurant>} Restaurant details.
 */
export function useRestaurant(id: string | undefined) {
  return useQuery<ApiResponse<Restaurant>, ApiError, Restaurant>({
    queryKey: ["restaurants", id],
    queryFn: (ctx) => getRestaurant(ctx.queryKey[1] as string), // queryKey[1] is the id string
    enabled: !!id,
    select: (res) => res.data,
  });
}

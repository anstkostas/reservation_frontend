import { useQuery } from "@tanstack/react-query";
import { getUnownedRestaurants, getRestaurants, getRestaurant } from "./api";

/**
 * Query to fetch unowned restaurants. Used in the SignupForm.
 * 
 * Logic:
 * - Query Key: `['/unowned-restaurants']`
 * - Enabled Status: Managed by the SignupForm's checkbox.
 * - Stale Time: 5 minutes.
 * - Selection: Returns `res.data`.
 * 
 * @param {object} params
 * @param {boolean} params.enabled
 * @returns {UseQueryResult}
 */
export function useUnownedRestaurantsQuery({ enabled }) {
  return useQuery({
    queryKey: ["/unowned-restaurants"],
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
 * @returns {UseQueryResult<Array>} List of restaurants.
 */
export function useRestaurants() {
  return useQuery({
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
 * @returns {UseQueryResult<object>} Restaurant details.
 */
export function useRestaurant(id) {
  return useQuery({
    queryKey: ["restaurants", id],
    queryFn: (ctx) => getRestaurant(ctx.queryKey[1]),
    enabled: !!id,
    select: (res) => res.data,
  });
}
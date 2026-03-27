import { apiFetch } from "@/lib/fetch";
import type { ApiResponse, Restaurant } from "@/types/api";

/**
 * Retrieves a list of restaurants that do not have an assigned owner.
 *
 * Logic:
 * - Public endpoint (auth: false).
 * - Used during Signup to allow new users to claim a restaurant.
 *
 * @returns {Promise<ApiResponse<Restaurant[]>>} List of unowned restaurant objects.
 */
export function getUnownedRestaurants(): Promise<ApiResponse<Restaurant[]>> {
  return apiFetch<ApiResponse<Restaurant[]>>("/users/unowned-restaurants", {
    auth: false,
  });
}

/**
 * Fetches all active restaurants.
 *
 * Logic:
 * - Public endpoint.
 * - Used in the RestaurantList feature to display available restaurants.
 *
 * @returns {Promise<ApiResponse<Restaurant[]>>} List of all restaurants.
 */
export function getRestaurants(): Promise<ApiResponse<Restaurant[]>> {
  return apiFetch<ApiResponse<Restaurant[]>>("/restaurants", {
    auth: false,
  });
}

/**
 * Fetches details for a specific restaurant.
 *
 * Logic:
 * - Public endpoint.
 * - Used in the RestaurantDetail view.
 *
 * @param {string} id - The restaurant UUID.
 * @returns {Promise<ApiResponse<Restaurant>>} The full restaurant profile.
 */
export function getRestaurant(id: string): Promise<ApiResponse<Restaurant>> {
  return apiFetch<ApiResponse<Restaurant>>(`/restaurants/${id}`, {
    auth: false,
  });
}

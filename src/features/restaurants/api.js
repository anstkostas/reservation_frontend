import { apiFetch } from "@/lib/fetch";

/**
 * Retrieves a list of restaurants that do not have an assigned owner.
 * 
 * Logic:
 * - Public endpoint (auth: false).
 * - Used during Signup to allow new users to claim a restaurant.
 * 
 * @returns {Promise<Array>} List of unowned restaurant objects.
 */
export function getUnownedRestaurants() {
  return apiFetch("/users/unowned-restaurants", {
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
 * @returns {Promise<Array>} List of all restaurants.
 */
export function getRestaurants() {
  return apiFetch("/restaurants", {
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
 * @returns {Promise<object>} The full restaurant profile.
 */
export function getRestaurant(id) {
  return apiFetch(`/restaurants/${id}`, {
    auth: false,
  });
}
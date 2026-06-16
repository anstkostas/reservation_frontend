import { apiFetch } from "@/lib/fetch";
import type { ApiResponse, Restaurant, RestaurantPrivate } from "@/types/api";

/** Payload for updating the owner's restaurant. The client sends all editable fields (see spec §0). */
export interface UpdateRestaurantPayload {
  name: string;
  description: { en: string; el: string };
  address: string;
  phone: string;
  capacity: number;
}

/**
 * Fetches the authenticated owner's own restaurant in the private shape (address, phone, both locales).
 *
 * Logic:
 * - Owner-only secure endpoint (cookie auth).
 * - Used to pre-fill the restaurant edit form.
 *
 * @returns {Promise<ApiResponse<RestaurantPrivate>>} The owner's restaurant.
 */
export function getOwnRestaurant(): Promise<ApiResponse<RestaurantPrivate>> {
  return apiFetch<ApiResponse<RestaurantPrivate>>("/restaurants/me");
}

/**
 * Updates the authenticated owner's own restaurant.
 *
 * Logic:
 * - Owner-only secure endpoint (cookie auth).
 * - Sends all editable fields; the backend validates and persists EN (canonical) + EL (translation).
 *
 * @param {UpdateRestaurantPayload} payload - The full set of editable fields.
 * @returns {Promise<ApiResponse<RestaurantPrivate>>} The updated restaurant.
 */
export function updateOwnRestaurant(payload: UpdateRestaurantPayload): Promise<ApiResponse<RestaurantPrivate>> {
  return apiFetch<ApiResponse<RestaurantPrivate>>("/restaurants/me", {
    method: "PUT",
    body: payload,
  });
}

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

import { apiFetch } from "@/lib/fetch";

/**
 * GET /unowned-restaurants
 * Returns a list of restaurants without an owner
 */
export function getUnownedRestaurants() {
  return apiFetch("/users/unowned-restaurants", {
    auth: false,
  });
}

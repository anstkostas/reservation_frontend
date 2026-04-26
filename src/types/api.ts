import { Role } from "@/constants";

/** Normalized error shape thrown by `apiFetch` and produced by `normalizeApiError`. */
export interface ApiError {
  message: string;
  details?: unknown[];
}

/** Possible statuses for a reservation — matches backend RESERVATION_STATUS constants and DB values. */
export type ReservationStatus = "active" | "canceled" | "completed" | "no-show";

/** Safe user shape returned by the API — matches backend UserOutput DTO. Password is never included. */
export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: Role;
}

/** Restaurant shape returned by the API — matches backend RestaurantOutput DTO. */
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  capacity: number;
  logoUrl: string;
  coverImageUrl: string;
  ownerId: string | null;
}

/**
 * Reservation shape returned by the API — matches backend ReservationOutput DTO.
 * The backend flattens joined relations: restaurant fields come as top-level strings,
 * customer comes as a nested object. scheduledAt is an ISO string on the wire (JSON serialization).
 */
export interface Reservation {
  id: string;
  scheduledAt: string;
  people: number;
  status: ReservationStatus;
  restaurantId: string;
  restaurantName: string | undefined;
  restaurantAddress: string | undefined;
  restaurantPhone: string | undefined;
  customerId: string;
  customer: Pick<User, "id" | "firstname" | "lastname" | "email"> | null;
}

/** Standard API envelope — wraps all successful responses from the backend. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

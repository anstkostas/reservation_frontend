import type { UseQueryResult } from "@tanstack/react-query";
import { Role, RESERVATION_STATUSES } from "@/constants";
import type { ApiError, Reservation, Restaurant, User } from "@/types/api";

export function createTestUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    firstname: "Test",
    lastname: "User",
    email: "test@example.com",
    role: Role.CUSTOMER,
    ...overrides,
  };
}

export function createTestRestaurant(overrides: Partial<Restaurant> = {}): Restaurant {
  return {
    id: "restaurant-1",
    name: "Test Restaurant",
    description: "Fixture restaurant",
    capacity: 20,
    logoUrl: "/logo.png",
    coverImageUrl: "/cover.png",
    ownerId: null,
    ...overrides,
  };
}

export function createTestReservation(overrides: Partial<Reservation> = {}): Reservation {
  return {
    id: "reservation-1",
    scheduledAt: "2026-05-01T19:00:00.000Z",
    people: 2,
    status: RESERVATION_STATUSES[0],
    restaurantId: "restaurant-1",
    restaurantName: "Test Restaurant",
    restaurantAddress: "1 Test Street",
    restaurantPhone: "0000000000",
    customerId: "customer-1",
    customer: {
      id: "customer-1",
      firstname: "Test",
      lastname: "Customer",
      email: "customer@example.com",
    },
    ...overrides,
  };
}

export function createQuerySuccessResult<TData>(
  data: TData
): UseQueryResult<TData, ApiError> {
  return {
    data,
    dataUpdatedAt: Date.now(),
    error: null,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isError: false,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isInitialLoading: false,
    isLoading: false,
    isLoadingError: false,
    isPaused: false,
    isPending: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isSuccess: true,
    refetch: async () => {
      throw new Error("refetch not implemented in test fixture");
    },
    status: "success",
    fetchStatus: "idle",
    promise: Promise.resolve(data),
    isEnabled: true,
  } as UseQueryResult<TData, ApiError>;
}

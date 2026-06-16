/**
 * Component tests for ReservationCard — status badge rendering and click behaviour.
 * Type: component (RTL render + userEvent, prop-driven — no hook mocking needed).
 *
 * Covers: status badge renders the correct translated label for every status in
 *   RESERVATION_STATUSES; restaurant name is displayed when present; falls back to
 *   "Restaurant #<id>" when restaurantName is missing; onClick is called with the
 *   reservation object when the card is clicked.
 * Not yet covered: date/time display format; guest count rendering; isLoading / skeleton state.
 * Oracle: display labels (Active, Canceled, Completed, No-show) from src/locales/en.json;
 *   RESERVATION_STATUSES constant from @/constants.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { RESERVATION_STATUSES } from "@/constants";
import { ReservationCard } from "@/features/reservations/components/ReservationCard";
import { createTestReservation } from "@/tests/fixtures/builders";

const baseReservation = createTestReservation();

// Display labels come from src/locales/en.json — regression-guard: not in project constants.
const STATUS_LABEL_MAP: Record<string, string> = {
  active: "Active",
  canceled: "Canceled",
  completed: "Completed",
  "no-show": "No-show",
};

describe("ReservationCard", () => {
  it.each(RESERVATION_STATUSES)(
    "renders status badge for %s",
    (status) => {
      render(
        <ReservationCard
          reservation={{ ...baseReservation, status }}
          onClick={vi.fn()}
        />
      );

      expect(screen.getByText(STATUS_LABEL_MAP[status])).toBeInTheDocument();
    }
  );

  it("renders restaurant name when present", () => {
    render(<ReservationCard reservation={baseReservation} onClick={vi.fn()} />);

    expect(screen.getByText("Test Restaurant")).toBeInTheDocument();
  });

  it("falls back to Restaurant #<id> when restaurantName is missing", () => {
    render(
      <ReservationCard
        reservation={{ ...baseReservation, restaurantName: undefined }}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText("Restaurant #restaurant-1")).toBeInTheDocument();
  });

  it("calls onClick with the reservation when the card is clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<ReservationCard reservation={baseReservation} onClick={handleClick} />);

    await user.click(screen.getByText("Test Restaurant"));

    expect(handleClick).toHaveBeenCalledWith(baseReservation);
  });
});

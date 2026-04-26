import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { RESERVATION_STATUSES } from "@/constants";
import { ReservationCard } from "@/features/reservations/components/ReservationCard";
import { createTestReservation } from "@/tests/fixtures/builders";

const baseReservation = createTestReservation();

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

      expect(screen.getByText(status)).toBeInTheDocument();
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

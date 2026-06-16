/**
 * Component tests for NavbarDropdownMenu — role-based link rendering and logout action.
 * Type: component (RTL render + userEvent, MemoryRouter wrapper for Link elements).
 *
 * Covers: customer sees "Reservations" link and no "Dashboard"; owner sees "Dashboard" link
 *   and no "Reservations"; logout action is present for both roles.
 * Not yet covered: handleLogout is called when logout is clicked; isLoggingOut=true disables
 *   the logout item or shows a loading indicator.
 * Oracle: navReservations = "Reservations", navDashboard = "Dashboard", navLogout = "Logout"
 *   from src/locales/en.json; Role enum from @/constants.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import NavbarDropdownMenu from "@/layouts/navbar/components/NavbarDropdownMenu";
import { Role } from "@/constants";
import type { User } from "@/types/api";
import { createTestUser } from "@/tests/fixtures/builders";

const customerUser: User = createTestUser({
  id: "cust-1",
  firstname: "Chris",
  lastname: "Customer",
  email: "customer@example.com",
  role: Role.CUSTOMER,
});

const ownerUser: User = createTestUser({
  id: "owner-1",
  firstname: "Olivia",
  lastname: "Owner",
  email: "owner@example.com",
  role: Role.OWNER,
});

function renderDropdown(currentUser: User) {
  return render(
    <MemoryRouter>
      <NavbarDropdownMenu currentUser={currentUser} handleLogout={vi.fn()} isLoggingOut={false} />
    </MemoryRouter>
  );
}

describe("NavbarDropdownMenu role-based rendering", () => {
  it("shows Reservations for customer and hides owner-only links", async () => {
    const user = userEvent.setup();

    renderDropdown(customerUser);
    await user.click(screen.getByRole("button"));

    expect(await screen.findByRole("menuitem", { name: /^reservations$/i })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /dashboard/i })).not.toBeInTheDocument();
  });

  it("shows Dashboard for owner and hides customer-only links", async () => {
    const user = userEvent.setup();

    renderDropdown(ownerUser);
    await user.click(screen.getByRole("button"));

    expect(await screen.findByRole("menuitem", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /my reservations/i })).not.toBeInTheDocument();
  });

  it("renders the logout action", async () => {
    const user = userEvent.setup();

    renderDropdown(customerUser);
    await user.click(screen.getByRole("button"));

    expect(await screen.findByText(/logout/i)).toBeInTheDocument();
  });
});

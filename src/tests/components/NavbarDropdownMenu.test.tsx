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
  it("shows My Reservations for customer and hides owner-only links", async () => {
    const user = userEvent.setup();

    renderDropdown(customerUser);
    await user.click(screen.getByRole("button"));

    expect(await screen.findByRole("menuitem", { name: /my reservations/i })).toBeInTheDocument();
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

    expect(await screen.findByText(/log out/i)).toBeInTheDocument();
  });
});

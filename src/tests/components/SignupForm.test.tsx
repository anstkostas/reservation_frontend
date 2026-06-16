/**
 * Component tests for SignupForm — validation errors and submission behaviour.
 * Type: component (RTL render + userEvent interactions, useAuth and useUnownedRestaurantsQuery mocked).
 *
 * Covers: validation — empty fields (name, email, password), password mismatch, password below
 *   complexity rules, no signupAsync call when invalid; submission — customer payload called
 *   correctly, root server error (no field details), field-level server error on email field.
 * Not yet covered: owner signup with restaurantId; isSigningUp=true disables the submit button;
 *   already-logged-in state; restaurant picker shows/hides based on isOwner checkbox.
 * Oracle: validation messages from validatorNameTooShort / validatorEmailRequired /
 *   validatorPasswordComplexity / validatorPasswordsMustMatch keys in src/locales/en.json;
 *   Role enum from @/constants.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import SignupForm from "@/features/auth/components/SignupForm";
import { useAuth } from "@/features/auth/useAuth";
import { useUnownedRestaurantsQuery } from "@/features/restaurants/queries";
import { createQuerySuccessResult } from "@/tests/fixtures/builders";
import { Role } from "@/constants";

vi.mock("@/features/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/features/restaurants/queries", () => ({
  useUnownedRestaurantsQuery: vi.fn(),
}));

describe("SignupForm validation", () => {
  const mockUseAuth = vi.mocked(useAuth);
  const mockUseUnownedRestaurantsQuery = vi.mocked(useUnownedRestaurantsQuery);
  const signupAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      currentUser: undefined,
      isLoadingUser: false,
      loginAsync: vi.fn(),
      isLoggingIn: false,
      signupAsync,
      logoutAsync: vi.fn(),
      isLoggingOut: false,
    });
    mockUseUnownedRestaurantsQuery.mockReturnValue(createQuerySuccessResult([]));
  });

  it("shows validation errors when submitted with empty fields", async () => {
    const user = userEvent.setup();

    render(<SignupForm onSwitchToLogin={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /create account/i }));

    // Both firstname and lastname use the same validatorNameTooShort key → same text
    const nameErrors = await screen.findAllByText("Must be at least 2 characters");
    expect(nameErrors).toHaveLength(2);
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
      )
    ).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();

    render(<SignupForm onSwitchToLogin={vi.fn()} />);

    await user.type(screen.getByLabelText(/first name/i), "Jane");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "StrongPass1!");
    await user.type(screen.getByLabelText(/confirm password/i), "DifferentPass1!");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
  });

  it("shows error for password that does not meet complexity rules", async () => {
    const user = userEvent.setup();

    render(<SignupForm onSwitchToLogin={vi.fn()} />);

    await user.type(screen.getByLabelText(/first name/i), "Jane");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "weak");
    await user.type(screen.getByLabelText(/confirm password/i), "weak");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText(
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
      )
    ).toBeInTheDocument();
  });

  it("does not call signupAsync when validation fails", async () => {
    const user = userEvent.setup();

    render(<SignupForm onSwitchToLogin={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(signupAsync).not.toHaveBeenCalled();
    });
  });
});

describe("SignupForm submission", () => {
  const mockUseAuth = vi.mocked(useAuth);
  const mockUseUnownedRestaurantsQuery = vi.mocked(useUnownedRestaurantsQuery);
  const signupAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      currentUser: undefined,
      isLoadingUser: false,
      loginAsync: vi.fn(),
      isLoggingIn: false,
      signupAsync,
      logoutAsync: vi.fn(),
      isLoggingOut: false,
    });
    mockUseUnownedRestaurantsQuery.mockReturnValue(createQuerySuccessResult([]));
  });

  const fillValidCustomerForm = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText(/first name/i), "Jane");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "StrongPass1!");
    await user.type(screen.getByLabelText(/confirm password/i), "StrongPass1!");
  };

  it("calls signupAsync with customer payload on valid submission", async () => {
    signupAsync.mockResolvedValueOnce({ success: true, data: {} });
    const user = userEvent.setup();

    render(<SignupForm onSwitchToLogin={vi.fn()} />);

    await fillValidCustomerForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(signupAsync).toHaveBeenCalledWith({
        firstname: "Jane",
        lastname: "Doe",
        email: "jane@example.com",
        password: "StrongPass1!",
        role: Role.CUSTOMER,
        restaurantId: null,
      });
    });
  });

  it("shows root server error when signupAsync rejects without field details", async () => {
    signupAsync.mockRejectedValueOnce({ message: "Email already in use", details: [] });
    const user = userEvent.setup();

    render(<SignupForm onSwitchToLogin={vi.fn()} />);

    await fillValidCustomerForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText("Email already in use")).toBeInTheDocument();
  });

  it("sets field error when signupAsync rejects with field-level details", async () => {
    signupAsync.mockRejectedValueOnce({
      message: "Validation failed",
      details: [{ field: "email", message: "Email already taken" }],
    });
    const user = userEvent.setup();

    render(<SignupForm onSwitchToLogin={vi.fn()} />);

    await fillValidCustomerForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText("Email already taken")).toBeInTheDocument();
  });
});

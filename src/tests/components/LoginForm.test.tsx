/**
 * Component tests for LoginForm — validation errors and submission behaviour.
 * Type: component (RTL render + userEvent interactions, useAuth mocked via vi.mock()).
 *
 * Covers: validation — empty email, empty password, malformed email, no loginAsync call when
 *   invalid; submission — calls loginAsync with credentials, root server error (no field details),
 *   field-level server error mapped to email field, already-logged-in state renders correctly.
 * Not yet covered: isLoggingIn=true disables the submit button; redirect after successful login
 *   (tested in e2e/auth.spec.ts).
 * Oracle: field-level error messages come from the auth schema's i18n keys; role values from
 *   Role enum in @/constants.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import LoginForm from "@/features/auth/components/LoginForm";
import { useAuth } from "@/features/auth/useAuth";
import { Role } from "@/constants";
import { createTestUser } from "@/tests/fixtures/builders";

vi.mock("@/features/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("LoginForm validation", () => {
  const mockUseAuth = vi.mocked(useAuth);
  const loginAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      currentUser: undefined,
      isLoadingUser: false,
      loginAsync,
      isLoggingIn: false,
      signupAsync: vi.fn(),
      logoutAsync: vi.fn(),
      isLoggingOut: false,
    });
  });

  it("shows email required error when submitted with empty email", async () => {
    const user = userEvent.setup();

    render(<LoginForm onSwitchToSignup={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
  });

  it("shows password required error when submitted with empty password", async () => {
    const user = userEvent.setup();

    render(<LoginForm onSwitchToSignup={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Password is required")).toBeInTheDocument();
  });

  it("shows invalid email error for malformed email", async () => {
    const user = userEvent.setup();

    render(<LoginForm onSwitchToSignup={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/^password$/i), "ValidPass1!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
  });

  it("does not call loginAsync when validation fails", async () => {
    const user = userEvent.setup();

    render(<LoginForm onSwitchToSignup={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(loginAsync).not.toHaveBeenCalled();
    });
  });
});

describe("LoginForm submission", () => {
  const mockUseAuth = vi.mocked(useAuth);
  const loginAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      currentUser: undefined,
      isLoadingUser: false,
      loginAsync,
      isLoggingIn: false,
      signupAsync: vi.fn(),
      logoutAsync: vi.fn(),
      isLoggingOut: false,
    });
  });

  it("calls loginAsync with credentials on valid submission", async () => {
    loginAsync.mockResolvedValueOnce({ success: true, data: {} });
    const user = userEvent.setup();

    render(<LoginForm onSwitchToSignup={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "ValidPass1!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(loginAsync).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "ValidPass1!",
      });
    });
  });

  it("shows root server error when loginAsync rejects without field details", async () => {
    loginAsync.mockRejectedValueOnce({ message: "Invalid credentials", details: [] });
    const user = userEvent.setup();

    render(<LoginForm onSwitchToSignup={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "ValidPass1!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("sets field error when loginAsync rejects with field-level details", async () => {
    loginAsync.mockRejectedValueOnce({
      message: "Validation failed",
      details: [{ field: "email", message: "No account with this email" }],
    });
    const user = userEvent.setup();

    render(<LoginForm onSwitchToSignup={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "ValidPass1!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("No account with this email")).toBeInTheDocument();
  });

  it("renders already-logged-in state when currentUser is present", () => {
    mockUseAuth.mockReturnValue({
      currentUser: createTestUser({
        id: "1",
        firstname: "Jane",
        lastname: "Doe",
        email: "user@example.com",
        role: Role.CUSTOMER,
      }),
      isLoadingUser: false,
      loginAsync,
      isLoggingIn: false,
      signupAsync: vi.fn(),
      logoutAsync: vi.fn(),
      isLoggingOut: false,
    });

    render(<LoginForm onSwitchToSignup={vi.fn()} />);

    expect(screen.getByText(/logged in as user@example\.com/i)).toBeInTheDocument();
  });
});

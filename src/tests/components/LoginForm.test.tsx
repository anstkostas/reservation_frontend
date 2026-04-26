import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import LoginForm from "@/features/auth/components/LoginForm";
import { useAuth } from "@/features/auth/useAuth";

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

    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
  });

  it("shows password required error when submitted with empty password", async () => {
    const user = userEvent.setup();

    render(<LoginForm onSwitchToSignup={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText("Password is required")).toBeInTheDocument();
  });

  it("shows invalid email error for malformed email", async () => {
    const user = userEvent.setup();

    render(<LoginForm onSwitchToSignup={vi.fn()} />);

    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/^password$/i), "ValidPass1!");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  it("does not call loginAsync when validation fails", async () => {
    const user = userEvent.setup();

    render(<LoginForm onSwitchToSignup={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(loginAsync).not.toHaveBeenCalled();
    });
  });
});

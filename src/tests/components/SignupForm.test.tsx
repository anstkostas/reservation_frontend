import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import SignupForm from "@/features/auth/components/SignupForm";
import { useAuth } from "@/features/auth/useAuth";
import { useUnownedRestaurantsQuery } from "@/features/restaurants/queries";
import { createQuerySuccessResult } from "@/tests/fixtures/builders";
import { Role } from "@/constants/auth";

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

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText("First name must be at least 2 characters")).toBeInTheDocument();
    expect(screen.getByText("Last name must be at least 2 characters")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 special char"
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
    await user.click(screen.getByRole("button", { name: /sign up/i }));

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
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(
      await screen.findByText(
        "Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 special char"
      )
    ).toBeInTheDocument();
  });

  it("does not call signupAsync when validation fails", async () => {
    const user = userEvent.setup();

    render(<SignupForm onSwitchToLogin={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /sign up/i }));

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
    await user.click(screen.getByRole("button", { name: /sign up/i }));

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
    await user.click(screen.getByRole("button", { name: /sign up/i }));

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
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText("Email already taken")).toBeInTheDocument();
  });
});

/**
 * Component tests for RestaurantEditForm — pre-fill, submit payload, validation, empty EL.
 * Type: component (RTL render + userEvent interactions, useUpdateRestaurantMutation mocked).
 *
 * Covers: form pre-fills from the fixture restaurant; valid submit sends a nested payload with
 *   description.en and description.el; validation blocks submit when name is too short;
 *   empty EL description is valid and sent as "".
 * Not yet covered: isPending=true disables the submit button and shows spinner.
 * Oracle: spec §3 Step B — expected payload structure and field labels from en.json.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { RestaurantEditForm } from "@/features/restaurants/components/RestaurantEditForm";
import { useUpdateRestaurantMutation } from "@/features/restaurants/queries";
import { createTestRestaurantPrivate } from "@/tests/fixtures/builders";

vi.mock("@/features/restaurants/queries", () => ({
  useUpdateRestaurantMutation: vi.fn(),
}));

describe("RestaurantEditForm", () => {
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUpdateRestaurantMutation).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateRestaurantMutation>);
  });

  describe("pre-fill", () => {
    it("pre-fills the Name input from the fixture restaurant", () => {
      render(<RestaurantEditForm restaurant={createTestRestaurantPrivate()} />);

      expect(screen.getByLabelText(/^name$/i)).toHaveValue("Test Restaurant");
    });

    it("pre-fills the EN description textarea from the fixture restaurant", () => {
      render(<RestaurantEditForm restaurant={createTestRestaurantPrivate()} />);

      expect(screen.getByLabelText(/description \(english\)/i)).toHaveValue("A test restaurant");
    });

    it("pre-fills the EL description textarea from the fixture restaurant", () => {
      render(<RestaurantEditForm restaurant={createTestRestaurantPrivate()} />);

      expect(screen.getByLabelText(/description \(greek\)/i)).toHaveValue(
        "Ένα δοκιμαστικό εστιατόριο"
      );
    });

    it("pre-fills capacity from the fixture restaurant", () => {
      render(<RestaurantEditForm restaurant={createTestRestaurantPrivate()} />);

      expect(screen.getByLabelText(/capacity/i)).toHaveValue(5);
    });

    it("pre-fills EL textarea as empty string when description.el is null", () => {
      render(
        <RestaurantEditForm
          restaurant={createTestRestaurantPrivate({ description: { en: "A test restaurant", el: null } })}
        />
      );

      expect(screen.getByLabelText(/description \(greek\)/i)).toHaveValue("");
    });
  });

  describe("valid submit", () => {
    it("sends a nested payload with description.en and description.el on valid submit", async () => {
      mutateAsync.mockResolvedValueOnce({ success: true, data: {} });
      const user = userEvent.setup();

      render(<RestaurantEditForm restaurant={createTestRestaurantPrivate()} />);

      await user.click(screen.getByRole("button", { name: /save changes/i }));

      await waitFor(() =>
        expect(mutateAsync).toHaveBeenCalledWith({
          name: "Test Restaurant",
          description: { en: "A test restaurant", el: "Ένα δοκιμαστικό εστιατόριο" },
          address: "1 Test Street",
          phone: "0000000000",
          capacity: 5,
        })
      );
    });
  });

  describe("validation", () => {
    it("shows name too-short error and does not call mutateAsync when name < 4 chars", async () => {
      const user = userEvent.setup();

      render(<RestaurantEditForm restaurant={createTestRestaurantPrivate()} />);

      await user.clear(screen.getByLabelText(/^name$/i));
      await user.type(screen.getByLabelText(/^name$/i), "ab");
      await user.click(screen.getByRole("button", { name: /save changes/i }));

      expect(await screen.findByText("Name must be at least 4 characters")).toBeInTheDocument();

      await waitFor(() => expect(mutateAsync).not.toHaveBeenCalled());
    });
  });

  describe("empty EL description", () => {
    it("calls mutateAsync with description.el === '' when EL textarea is cleared", async () => {
      mutateAsync.mockResolvedValueOnce({ success: true, data: {} });
      const user = userEvent.setup();

      render(<RestaurantEditForm restaurant={createTestRestaurantPrivate()} />);

      await user.clear(screen.getByLabelText(/description \(greek\)/i));
      await user.click(screen.getByRole("button", { name: /save changes/i }));

      await waitFor(() =>
        expect(mutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({ description: expect.objectContaining({ el: "" }) })
        )
      );
    });
  });
});

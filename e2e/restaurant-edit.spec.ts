/**
 * e2e tests for the owner restaurant-edit flow.
 * Type: e2e (Playwright, seeded test DB, backend must be running on the test env).
 *
 * Covers: navbar dropdown → /my-restaurant entry point is wired and owner-gated;
 *   GET /restaurants/me populates form fields (auth cookie sent, private DTO mapped to inputs);
 *   PUT /restaurants/me persists changes through the full stack (value survives reload).
 * Not yet covered: form validation errors (covered by the RestaurantEditForm component test).
 * Prerequisites: backend running on dev:test env with seeded test credentials
 *   (owner1@restaurant.com / rest123) and the test DB up.
 */

import { expect, test } from "@playwright/test";
import { loginAsOwner } from "./helpers";

test.describe("Owner Restaurant Edit Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("entry point: navbar dropdown navigates to /my-restaurant and form is pre-filled", async ({
    page,
  }) => {
    await loginAsOwner(page);

    // Open the account dropdown and navigate via the "My restaurant" item
    await page.getByRole("button", { name: "User menu" }).click();
    await page.getByRole("menuitem", { name: /My restaurant/i }).click();
    await page.waitForURL("**/my-restaurant");

    await expect(page.getByRole("heading", { name: "Edit restaurant" })).toBeVisible();

    // Seed-agnostic: proves GET /restaurants/me returned data and the form was populated
    expect(await page.getByLabel("Name").inputValue()).not.toBe("");
    expect(await page.getByLabel("Address").inputValue()).not.toBe("");
    expect(await page.getByLabel("Phone").inputValue()).not.toBe("");
  });

  test("edit persists across reload — PUT /restaurants/me contract test", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/my-restaurant");

    // Capture originals before mutating — required for the restore step below
    const originalName = await page.getByLabel("Name").inputValue();
    const originalEl = await page.getByLabel("Description (Greek)").inputValue();

    try {
      const uniqueName = `E2E Bistro ${Date.now()}`;

      await page.getByLabel("Name").clear();
      await page.getByLabel("Name").fill(uniqueName);
      await page.getByLabel("Description (Greek)").clear();
      await page.getByLabel("Description (Greek)").fill("Δοκιμή e2e");

      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(page.getByText("Restaurant updated successfully")).toBeVisible();

      // Reload proves the write hit the DB, not just local React state
      await page.reload();
      expect(await page.getByLabel("Name").inputValue()).toBe(uniqueName);
      expect(await page.getByLabel("Description (Greek)").inputValue()).toBe("Δοκιμή e2e");
    } finally {
      // Restore original values so shared DB state is clean for subsequent specs and re-runs
      await page.getByLabel("Name").clear();
      await page.getByLabel("Name").fill(originalName);
      await page.getByLabel("Description (Greek)").clear();
      await page.getByLabel("Description (Greek)").fill(originalEl);
      await page.getByRole("button", { name: "Save changes" }).click();
      await expect(page.getByText("Restaurant updated successfully")).toBeVisible();
    }
  });
});

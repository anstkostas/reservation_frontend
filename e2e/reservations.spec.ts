/**
 * e2e tests for the reservation flows (customer and owner).
 * Type: e2e (Playwright, seeded test DB, backend must be running on the test env).
 *
 * Covers: customer can book a table at a restaurant; customer can cancel an upcoming reservation
 *   (soft cancel — card moves to History tab); owner dashboard renders with tabs and search;
 *   owner search filters reservations (empty result on no-match term).
 * Not yet covered: "Complete" and "No-show" actions — only appear when scheduledAt <= now,
 *   which is not achievable with current seed data (see NOTE comment in Owner tests);
 *   booking validation errors shown in the dialog; owner pagination if list is long.
 * Prerequisites: backend running on dev:test env with seeded test credentials
 *   (customer1@test.com / cust123, owner1@restaurant.com / rest123).
 */

import { expect, test, type Page } from "@playwright/test";
import { loginAsCustomer, loginAsOwner } from "./helpers";

// Returns a future date as "yyyy-MM-dd", offset by the given number of days from today.
// Using different offsets across tests avoids the 4-hour per-customer conflict buffer (DOMAIN.md).
function futureDateString(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
}

// Books a table at the first restaurant in the list.
// daysAhead must stay >15 to clear the seed's ±15-day range and avoid
// conflicts with seeded reservations. Different values across tests avoid
// the 4-hour per-customer active reservation conflict buffer (DOMAIN.md).
async function bookFirstRestaurant(page: Page, daysAhead = 30): Promise<void> {
  await page.goto("/restaurants");
  await page.getByRole("link", { name: "View Details & Book" }).first().click();
  await page.getByRole("button", { name: "Book a Table" }).click();
  await page.getByLabel("Date").fill(futureDateString(daysAhead));
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByRole("dialog", { name: "Make a Reservation" })).not.toBeVisible();
}

test.describe("Customer Reservation Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("customer can book a table at a restaurant", async ({ page }) => {
    await loginAsCustomer(page);
    await bookFirstRestaurant(page);

    await page.goto("/my-reservations");
    // At least one upcoming reservation card should be visible
    await expect(
      page.getByRole("tabpanel").locator('[class*="cursor-pointer"]').first()
    ).toBeVisible();
  });

  test("customer can cancel an upcoming reservation", async ({ page }) => {
    await loginAsCustomer(page);

    // Book at +31 days to avoid the 4-hour conflict buffer with the booking test (+30 days)
    await bookFirstRestaurant(page, 31);

    await page.goto("/my-reservations");

    // Click the first card in the upcoming tab panel
    await page.getByRole("tabpanel").locator('[class*="cursor-pointer"]').first().click();

    // Two-step cancel: open confirm dialog, then confirm
    await page.getByRole("button", { name: "Cancel" }).click();
    await page.getByRole("button", { name: "Cancel reservation" }).click();

    await expect(page.getByRole("dialog", { name: "Reservation Details" })).not.toBeVisible();

    // Canceled reservation appears in the History tab
    await page.getByRole("tab", { name: /History/ }).click();
    await expect(
      page.getByRole("tabpanel").locator('[class*="cursor-pointer"]').first()
    ).toBeVisible();
  });
});

test.describe("Owner Dashboard Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("owner dashboard renders with tabs and search", async ({ page }) => {
    await loginAsOwner(page);

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Active/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /History/ })).toBeVisible();
    await expect(page.getByPlaceholder("Search by name or email...")).toBeVisible();
  });

  test("owner search filters reservations", async ({ page }) => {
    await loginAsOwner(page);

    // Searching for a term that matches no customer always produces an empty table,
    // regardless of how many reservations exist — reliable without depending on seed data
    await page.getByPlaceholder("Search by name or email...").fill("zzz_no_match");
    await expect(page.getByRole("cell", { name: "No reservations found." })).toBeVisible();
  });

  // NOTE: "Complete" and "No-show" action buttons are NOT tested here.
  // They only appear when scheduledAt <= now (canUpdate returns true).
  // The seed marks all past reservations as completed/no-show — no active reservation
  // has a past date, so these buttons are never rendered against the seeded test data.
  // To test them, seed a dedicated active reservation with a past scheduledAt,
  // or add a Playwright API setup step that creates one via the backend.
});

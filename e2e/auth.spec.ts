/**
 * e2e tests for the authentication flow.
 * Type: e2e (Playwright, seeded test DB, backend must be running on the test env).
 *
 * Covers: customer login redirects to /my-reservations; owner login redirects to /owner-dashboard;
 *   logout clears session and redirects to home, then blocks access to protected routes;
 *   unauthenticated direct navigation to /my-reservations redirects to /login;
 *   failed login (wrong password) keeps user on /login.
 * Not yet covered: signup flow; token refresh behaviour across tabs; session persistence
 *   across page reload; signup as owner with restaurant selection.
 * Prerequisites: backend running on dev:test env with seeded test credentials
 *   (customer1@test.com / cust123, owner1@restaurant.com / rest123).
 */

import { expect, test } from "@playwright/test";
import {
  CUSTOMER_EMAIL,
  CUSTOMER_PASSWORD,
  loginAsCustomer,
  loginAsOwner,
} from "./helpers";

test.describe("Auth Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("successful login redirects customer to /my-reservations", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(CUSTOMER_EMAIL);
    await page.getByLabel("Password").fill(CUSTOMER_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/my-reservations$/);
  });

  test("logout redirects away from protected pages", async ({ page }) => {
    await loginAsCustomer(page);

    await page.getByRole("button", { name: "User menu" }).click();
    await page.getByRole("menuitem", { name: "Logout" }).click();

    await expect(page).toHaveURL(/\/$/);
    await page.goto("/my-reservations");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("unauthenticated user is redirected from /my-reservations to /login", async ({ page }) => {
    await page.goto("/my-reservations");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("failed login keeps user on /login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(CUSTOMER_EMAIL);
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test("successful owner login redirects to /owner-dashboard", async ({ page }) => {
    await loginAsOwner(page);

    await expect(page).toHaveURL(/\/owner-dashboard$/);
  });
});

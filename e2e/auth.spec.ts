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
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/my-reservations$/);
  });

  test("logout redirects away from protected pages", async ({ page }) => {
    await loginAsCustomer(page);

    await page.getByRole("button", { name: "User menu" }).click();
    await page.getByRole("menuitem", { name: "Log out" }).click();

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
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test("successful owner login redirects to /owner-dashboard", async ({ page }) => {
    await loginAsOwner(page);

    await expect(page).toHaveURL(/\/owner-dashboard$/);
  });
});

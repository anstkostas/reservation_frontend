import type { Page } from "@playwright/test";

export const CUSTOMER_EMAIL = "customer1@test.com";
export const CUSTOMER_PASSWORD = "cust123";
export const OWNER_EMAIL = "owner1@restaurant.com";
export const OWNER_PASSWORD = "rest123";

export async function loginAsCustomer(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(CUSTOMER_EMAIL);
  await page.getByLabel("Password").fill(CUSTOMER_PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL("**/my-reservations");
}

export async function loginAsOwner(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(OWNER_EMAIL);
  await page.getByLabel("Password").fill(OWNER_PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL("**/owner-dashboard");
}

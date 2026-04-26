import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "vite";
import process from "node:process";

const env = loadEnv("test", process.cwd(), "");
const frontendPort = env.VITE_PORT || "22101";
const baseURL = `http://localhost:${frontendPort}`;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  // Run tests serially — avoids parallel auth state conflicts
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",

  use: {
    // The running React dev server — start it manually before running tests
    baseURL,
    // Always capture trace on failure — viewable in the Playwright trace viewer
    trace: "on-first-retry",
  },

  webServer: {
    command: "npm run dev:test",
    url: baseURL,
    // Reuse an already-running server locally; always start fresh on CI
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

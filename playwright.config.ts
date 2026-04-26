import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  // Run tests serially — avoids parallel auth state conflicts
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',

  use: {
    // The running React dev server — start it manually before running tests
    baseURL: 'http://localhost:5174',
    // Always capture trace on failure — viewable in the Playwright trace viewer
    trace: 'on-first-retry',
  },

  webServer: {
    command: 'npm run dev:test',
    url: 'http://localhost:5174',
    // Reuse an already-running server locally; always start fresh on CI
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Folder that contains all Playwright specs.
  testDir: './tests',

  // Allow tests from different files to run in parallel.
  fullyParallel: true,

  // Fail CI if `test.only` was accidentally committed.
  forbidOnly: !!process.env.CI,

  // Retry only in CI to reduce flaky failures.
  retries: process.env.CI ? 2 : 0,

  // Keep CI runs stable by reducing concurrency.
  workers: process.env.CI ? 1 : undefined,

  // Generate an HTML report after test runs.
  reporter: 'html',

  use: {
    // Backend base URL for API requests (override with `API_BASE_URL`).
    baseURL: process.env.API_BASE_URL ?? 'http://localhost:8080',

    // Collect trace only when a test retries.
    trace: 'on-first-retry',
  },
  
  projects: [
    {
      // Single browser target keeps backend API tests fast and deterministic.
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

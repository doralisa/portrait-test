import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/challenges',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['./tests/reporters/custom-reporter.ts'],
    ['./tests/reporters/html-reporter.ts']
  ],
  use: {
    baseURL: 'http://localhost:3456',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Visual regression testing options
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // webServer disabled - handled by GitHub Actions workflow
  // webServer: {
  //   command: 'PORT=3456 npm run dev',
  //   url: 'http://localhost:3456',
  //   reuseExistingServer: !process.env.CI,
  // },
})
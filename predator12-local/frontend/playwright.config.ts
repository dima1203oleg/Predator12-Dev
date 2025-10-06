import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    trace: 'off'
  },
  projects: [
    { name: 'chromium-lg', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'chromium-md', use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } } },
    { name: 'chromium-sm', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } }
  ]
});



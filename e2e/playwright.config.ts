import { defineConfig, devices } from '@playwright/test';

// BASE_URL points at any deployment: the local stack (default), lademo, staging...
const baseURL = process.env.BASE_URL || 'http://e2e.localhost:18080';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    locale: process.env.E2E_LOCALE || 'en',
    trace: 'retain-on-failure',
    // what the browser really shows: a screenshot after every browser test, a video when it fails
    screenshot: 'on',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'api', testMatch: /.*\.api\.spec\.ts/ },
    { name: 'browser', testMatch: /.*\.ui\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
});

import { defineConfig, devices } from '@playwright/test';

// BASE_URL points at any deployment: the local stack (default), lademo, staging...
const baseURL = process.env.BASE_URL || 'http://e2e.localhost:18080';

// E2E_REMOTE=1 (a real deployment, e.g. the CI one with CAS): only the read-only smoke specs. The others create
// areas/tasks and rely on the synthetic fixtures of the local stack (states layer, grids), so they must not run there.
const remoteIgnore = process.env.E2E_REMOTE
  ? [/area\./, /aoo-eoo/, /envelope/, /scatterplot/, /area-report/, /contextual-layer/]
  : undefined;

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
    { name: 'api', testMatch: /.*\.api\.spec\.ts/, testIgnore: remoteIgnore },
    { name: 'browser', testMatch: /.*\.ui\.spec\.ts/, testIgnore: remoteIgnore, use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
});

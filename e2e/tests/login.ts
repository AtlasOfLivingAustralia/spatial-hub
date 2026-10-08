import { Page } from '@playwright/test';

// The stack runs a mock OIDC provider: any user name signs in. Against a real deployment
// set E2E_USER / E2E_PASSWORD and extend this helper for that provider's login form.
export async function login(page: Page, user = process.env.E2E_USER || 'e2e') {
  await page.goto('/');
  if (new URL(page.url()).pathname.endsWith('/authorize')) {
    await page.fill('input[name=username]', user);
    await page.click('input[type=submit]');
  }
  await page.waitForSelector('.leaflet-container', { timeout: 60_000 });
}

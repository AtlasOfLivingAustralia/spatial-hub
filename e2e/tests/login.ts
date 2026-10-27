import { Page } from '@playwright/test';

// Signs in and waits for the map. Two providers:
//  - the local stack's mock OIDC: any user name signs in (no password);
//  - a real deployment (CAS/OIDC login form): set E2E_USER and E2E_PASSWORD (from the CI credentials; never
//    committed). The helper fills the first username/password form it finds.
export async function login(page: Page, user = process.env.E2E_USER || 'e2e') {
  await page.goto('/');
  const password = process.env.E2E_PASSWORD;
  const form = page.locator('input[name=username], #username').first();
  // the hub redirects to the provider's login page when there is no session
  await form.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined);
  if (await form.isVisible().catch(() => false)) {
    if (password) {
      await form.fill(user);
      const pass = page.locator('input[name=password], #password').first();
      await pass.fill(password);
      // Enter in the password field submits the login form itself: a generic submit selector would
      // also match the search button of the branding header (it sent us to /search?q=).
      await pass.press('Enter');
    } else {
      // mock provider
      await form.fill(user);
      await page.click('input[type=submit]');
    }
  }
  await page.waitForSelector('.leaflet-container', { timeout: 60_000 });
}

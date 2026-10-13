import { test, expect } from '@playwright/test';
import { login } from './login';

test.describe('hub', () => {
  test('signs in and shows the map without script errors', async ({ page, baseURL }) => {
    // Only errors raised by the hub itself count: login() passes through the identity provider's login page
    // (CAS on a real deployment), whose own scripts are not what this spec is about.
    const hubOrigin = new URL(baseURL as string).origin;
    const errors: string[] = [];
    page.on('pageerror', (e) => {
      if (new URL(page.url()).origin === hubOrigin) errors.push(e.message);
    });
    await login(page);
    await expect(page.locator('.leaflet-container').first()).toBeVisible();
    await expect(page.getByText(/Add to map|Añadir al mapa/).first()).toBeVisible();
    expect(errors).toEqual([]);
  });
});

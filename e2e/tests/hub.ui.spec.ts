import { test, expect } from '@playwright/test';
import { login } from './login';

test.describe('hub', () => {
  test('signs in and shows the map without script errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await login(page);
    await expect(page.locator('.leaflet-container').first()).toBeVisible();
    await expect(page.getByText(/Add to map|Añadir al mapa/).first()).toBeVisible();
    expect(errors).toEqual([]);
  });
});

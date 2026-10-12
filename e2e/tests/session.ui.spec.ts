import { test, expect } from '@playwright/test';
import { login } from './login';
import { shot } from './shots';
import { openAddArea, chooseAreaMethod, dragOnMap, finishDrawnArea } from './areas';

// Save a session, open its link in a fresh page and find the area again.
test('save a session and load it back', async ({ page, browser }, testInfo) => {
  await login(page);
  await openAddArea(page);
  await chooseAreaMethod(page, 'drawBoundingBox');
  await dragOnMap(page, [0.4, 0.4], [0.5, 0.55]);
  await finishDrawnArea(page, testInfo, 'e2e session area');

  await page.getByText('Save', { exact: true }).first().click();
  await page.locator('.modal-footer').getByText('OK', { exact: true }).click(); // the session name dialog
  const link = page.locator('.modal-body a[href*="ss="]').first();
  await expect(link).toBeVisible({ timeout: 30_000 });
  const href = (await link.getAttribute('href'))!;
  await shot(page, testInfo, 'session saved');
  expect(href).toMatch(/[?&]ss=\d+/);

  // the same user, a new page: the session restores the area
  await page.goto(href);
  await page.waitForSelector('.leaflet-container', { timeout: 60_000 });
  await expect(page.getByText('e2e session area').first()).toBeVisible({ timeout: 30_000 });
  await shot(page, testInfo, 'session loaded');
});

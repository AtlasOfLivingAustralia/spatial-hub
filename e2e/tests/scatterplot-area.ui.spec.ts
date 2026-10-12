import { test, expect } from '@playwright/test';
import { login } from './login';
import { shot } from './shots';
import { importAreaFile } from './areas';

// Regression for AtlasOfLivingAustralia/spatial-service#281: a scatterplot on species restricted to an area failed with "Unknown geometry type: <pid>" (the hub sends the area pid as the layer's wkt).
test('scatterplot on all species restricted to an imported area', async ({ page }, testInfo) => {
  test.setTimeout(Number(process.env.E2E_SLOW_TIMEOUT) || 240_000);
  await login(page);
  await importAreaFile(page, testInfo, 'importKML', 'tests/fixtures/squares.kml', 'new area');

  // Tools > Scatterplot - single, on that layer
  await page.locator("button[testTag='menu']", { hasText: 'Tools' }).click();
  await page.locator("ul li a[testTag='menuItem']", { hasText: 'Scatterplot - single' }).click();
  await expect(page.locator("h4.modal-title[testTag='modalTitle']")).toHaveText('Create a scatterplot.');
  // step 1: the area; step 2: all species (the hub registers them restricted to the area)
  await page.locator("input[testTag='selectArea']").first().check();
  await page.locator("input[type='radio'][value='allSpecies']").first().check();
  await expect(page.locator("tr[testTag='availableLayers'] td[testTag='layerName']").first()).toBeVisible({ timeout: 30_000 });
  for (const name of ['E2E synthetic temperature', 'E2E synthetic rainfall']) {
    await page.locator("tr[testTag='availableLayers'] td[testTag='layerName']", { hasText: name }).locator('xpath=../td//input[@type="checkbox"]').first().check();
  }
  await shot(page, testInfo, '2 scatterplot dialog');
  await page.locator("button[name='next']").click();

  // finishes with a plot image, and never with the geometry error
  const plot = page.locator("[style*='tasks/output']").first();
  await expect(plot).toBeVisible({ timeout: 150_000 });
  await expect(page.getByText(/Unknown geometry type/)).toHaveCount(0);
  await shot(page, testInfo, '3 scatterplot');
});

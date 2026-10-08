import { test, expect } from '@playwright/test';
import { login } from './login';
import { shot } from './shots';

// Tools > Scatterplot - single, through the hub. Species are "All species" from the biocache stub, layers the synthetic
// grids e2e_temp and e2e_rain; the testTag attributes are the ones the Geb page modules use.
test('single scatterplot for all species and two environmental layers', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  await login(page);
  await page.locator("button[testTag='menu']", { hasText: 'Tools' }).click();
  await page.locator("ul li a[testTag='menuItem']", { hasText: 'Scatterplot - single' }).click();
  const title = page.locator("h4.modal-title[testTag='modalTitle']");
  await expect(title).toHaveText('Create a scatterplot.');
  await shot(page, testInfo, '1 dialog');

  // step 2: all species
  await page.locator("input[type='radio'][value='allSpecies']").first().check();
  // step 4: two environmental layers
  await expect(page.locator("tr[testTag='availableLayers'] td[testTag='layerName']").first()).toBeVisible({ timeout: 30_000 });
  for (const name of ['E2E synthetic temperature', 'E2E synthetic rainfall']) {
    await page.locator("tr[testTag='availableLayers'] td[testTag='layerName']", { hasText: name }).locator('xpath=../td//input[@type="checkbox"]').first().check();
  }
  await shot(page, testInfo, '2 species and layers selected');
  await expect(page.locator("label[testTag='countSelectedLayers']")).toContainText('2 of');
  await page.locator("button[name='next']").click();

  // the task runs and the hub adds the species layer with its scatterplot legend
  await expect(page.getByText('All species').filter({ visible: true }).first()).toBeVisible({ timeout: 120_000 });
  // the plot image served by the service is the background of the legend's scatterplot area
  const area = page.locator("[style*='tasks/output']").first();
  await expect(area).toBeVisible({ timeout: 30_000 });
  const url = await area.evaluate((e) => getComputedStyle(e).backgroundImage.replace(/^url\(["']?|["']?\)$/g, ''));
  expect(url).toContain('/tasks/output/');
  const png = await page.request.get(url);
  expect(png.status()).toBe(200);
  expect([...(await png.body()).subarray(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
  await shot(page, testInfo, '3 scatterplot layer');
  await expect(page.getByText('Authentication failed')).toHaveCount(0);
});

import { test, expect, Page } from '@playwright/test';
import { login } from './login';
import { shot } from './shots';

// Areas through the hub UI (the testTag attributes are the ones the Geb page modules use).
async function openAddArea(page: Page) {
  await page.locator("button[testTag='menu']", { hasText: 'Add to map' }).click();
  await page.locator("ul li a[testTag='menuItem']", { hasText: 'Area' }).first().click();
  await expect(page.locator("div[testTag='addAreaModal']")).toBeVisible();
}

test.describe('areas in the hub', () => {
  test('draw a bounding box on the map', async ({ page }, testInfo) => {
    await login(page);
    await openAddArea(page);
    await shot(page, testInfo, '1 add area dialog');
    await page.locator("input[type='radio'][value='drawBoundingBox']").check();
    await page.getByRole('button', { name: /next/i }).first().click();
    await expect(page.locator("div[testTag='createAreaLegend']")).toBeVisible();

    const map = page.locator('.angular-leaflet-map');
    const box = (await map.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.4);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.55, { steps: 8 });
    await page.mouse.up();

    const wkt = page.locator("textarea[testTag='newAreaWKT']");
    await expect(wkt).not.toHaveValue('', { timeout: 15_000 });
    await shot(page, testInfo, '2 box drawn');
    expect(await wkt.inputValue()).toMatch(/^(MULTI)?POLYGON/);
    await page.locator("input[testTag='newAreaName']").fill('e2e box');
    await page.locator("button[testTag='nextInNewAreaLegend']").click();
    await expect(page.getByText('e2e box').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Authentication failed')).toHaveCount(0);
    await shot(page, testInfo, '3 area in the layer list');
  });
});

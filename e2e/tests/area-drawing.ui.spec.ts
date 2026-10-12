import { test, expect } from '@playwright/test';
import { login } from './login';
import { openAddArea, chooseAreaMethod, dragOnMap, clickPolyline, finishDrawnArea } from './areas';

// The ways of drawing an area on the map. Each one used to be checked by hand on every release.
test.describe('drawing areas in the hub', () => {
  test('point and radius', async ({ page }, testInfo) => {
    await login(page);
    await openAddArea(page);
    await chooseAreaMethod(page, 'drawPointRadius');
    await dragOnMap(page, [0.5, 0.5], [0.58, 0.5]);
    await finishDrawnArea(page, testInfo, 'e2e circle');
  });

  test('polyline with buffer', async ({ page }, testInfo) => {
    await login(page);
    await openAddArea(page);
    await chooseAreaMethod(page, 'drawPolyline');
    await clickPolyline(page, [[0.35, 0.6], [0.5, 0.4], [0.65, 0.6]]);
    await page.locator("input[ng-model='radiusKm']").fill('50');
    await finishDrawnArea(page, testInfo, 'e2e line');
  });

  test('polygon', async ({ page }, testInfo) => {
    await login(page);
    await openAddArea(page);
    await chooseAreaMethod(page, 'drawPolygon');
    await clickPolyline(page, [[0.4, 0.4], [0.6, 0.4], [0.6, 0.6], [0.4, 0.6]], true);
    await finishDrawnArea(page, testInfo, 'e2e polygon');
  });
});

import { test } from '@playwright/test';
import { login } from './login';
import { importAreaFile } from './areas';

// Fixtures: tests/fixtures/make-fixtures.sh (two squares in Tasmania).
test.describe('importing areas', () => {
  test('KML', async ({ page }, testInfo) => {
    await login(page);
    await importAreaFile(page, testInfo, 'importKML', 'tests/fixtures/squares.kml', 'e2e kml');
  });

  test('zipped shapefile', async ({ page }, testInfo) => {
    await login(page);
    await importAreaFile(page, testInfo, 'importShapefile', 'tests/fixtures/squares-shp.zip', 'e2e shapefile');
  });
});

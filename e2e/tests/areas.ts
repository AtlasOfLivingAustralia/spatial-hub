import { expect, Page, TestInfo } from '@playwright/test';
import { shot } from './shots';

// Helpers shared by the area/session specs (the testTag attributes are the ones the Geb page modules use).

export async function openAddArea(page: Page) {
  await page.locator("button[testTag='menu']", { hasText: 'Add to map' }).click();
  await page.locator("ul li a[testTag='menuItem']", { hasText: 'Area' }).first().click();
  await expect(page.locator("div[testTag='addAreaModal']")).toBeVisible();
}

// Picks the way of defining the area and goes to the next step.
export async function chooseAreaMethod(page: Page, value: string) {
  await page.locator(`input[type='radio'][value='${value}']`).check();
  await page.getByRole('button', { name: /next/i }).first().click();
}

export const mapBox = async (page: Page) => (await page.locator('.angular-leaflet-map').boundingBox())!;

// Mouse moves in steps: Leaflet.draw needs mousemove events between the clicks, a bare click does not draw.
export async function dragOnMap(page: Page, from: [number, number], to: [number, number]) {
  const b = await mapBox(page);
  await page.mouse.move(b.x + b.width * from[0], b.y + b.height * from[1]);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * to[0], b.y + b.height * to[1], { steps: 10 });
  await page.mouse.up();
}

export async function clickPolyline(page: Page, points: [number, number][], close = false) {
  const b = await mapBox(page);
  const at = ([fx, fy]: [number, number]) => [b.x + b.width * fx, b.y + b.height * fy] as const;
  const [x0, y0] = at(points[0]);
  await page.mouse.move(x0, y0);
  for (const p of points) {
    const [x, y] = at(p);
    await page.mouse.move(x, y, { steps: 6 });
    await page.mouse.click(x, y);
  }
  // clicking the last vertex again finishes a line; a polygon is closed by clicking its first vertex
  const [xl, yl] = at(close ? points[0] : points[points.length - 1]);
  await page.mouse.move(xl, yl, { steps: 6 });
  await page.mouse.click(xl, yl);
}

// Name the drawn area, accept it and wait for it in the layer list.
export async function finishDrawnArea(page: Page, testInfo: TestInfo, name: string) {
  const wkt = page.locator("textarea[testTag='newAreaWKT']");
  await expect(wkt).not.toHaveValue('', { timeout: 15_000 });
  expect(await wkt.inputValue()).toMatch(/^(MULTI)?POLYGON/);
  await shot(page, testInfo, `drawn ${name}`);
  await page.locator("input[testTag='newAreaName']").fill(name);
  await page.locator("button[testTag='nextInNewAreaLegend']").click();
  await expect(page.getByText(name).first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Authentication failed')).toHaveCount(0);
}

// Imports a KML or a zipped shapefile as an area; returns once the area is in the layer list.
export async function importAreaFile(page: Page, testInfo: TestInfo, kind: 'importKML' | 'importShapefile', file: string, name: string) {
  await openAddArea(page);
  await page.locator(`input[type='radio'][value='${kind}']`).check();
  await page.getByRole('button', { name: /next/i }).first().click();
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator("button[testTag='uploadFile']").click()]);
  await chooser.setFiles(file);
  if (kind === 'importShapefile') {
    // the shapefile's features are listed: select them all and name the merged area
    await expect(page.locator("input[testTag='newAreaInList']").first()).toBeVisible({ timeout: 30_000 });
    await page.locator("input[testTag='newAreaInList']").first().check();
    await page.locator("input[testTag='importAreaName']").fill(name);
  }
  await shot(page, testInfo, `${kind} uploaded`);
  if (kind === 'importShapefile') {
    await page.getByRole('button', { name: /next|finish|ok/i }).last().click();
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 30_000 });
  } else {
    // a KML area is added as soon as the file is read and is always called "new area"
    await expect(page.getByText('new area').first()).toBeVisible({ timeout: 30_000 });
  }
  await expect(page.getByText('Authentication failed')).toHaveCount(0);
}

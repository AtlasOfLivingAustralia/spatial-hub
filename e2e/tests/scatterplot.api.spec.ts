import { test, expect, APIRequestContext } from '@playwright/test';

import { runTask } from './tasks';
import { stubPoints, extentsOf, box } from './stub-data';

// ScatterplotCreate end to end: species points come from the biocache stub (stack/biocache-stub), environmental values
// from the synthetic grids e2e_temp (el9001) and e2e_rain (el9002), linear in lat/lon (stack/fixtures/make-grids.py).
async function scatterplot(request: APIRequestContext, wkt: string) {
  const { id, status } = await runTask(request, 'ScatterplotCreate', {
    area: [{ type: 'wkt', wkt, name: 'e2e scatterplot area' }],
    species1: { q: ['*:*'], bs: 'http://biocache:8080', name: 'Eucalyptus e2e' },
    layer: ['el9001', 'el9002'],
    grid: false,
    resolution: '0.5',
  });
  expect(status.status, JSON.stringify(status)).toBe(4);
  const species = JSON.parse(status.output.find((o: any) => o.name === 'species').file);
  return { id, species };
}
const near = (actual: number[][], expected: number[][]) =>
  actual.flat().forEach((v, i) => expect(v).toBeCloseTo(expected.flat()[i], 2));

test.describe('scatterplot task', () => {
  test('sampled grid values span the whole stub dataset, and the plot image is a PNG', async ({ request }) => {
    const { species } = await scatterplot(request, box(112, -44, 154, -10));
    expect(species.scatterplotLayers).toEqual(['el9001', 'el9002']);
    near(species.scatterplotExtents, extentsOf(stubPoints));
    const img = await request.get(species.scatterplotUrl);
    expect(img.status()).toBe(200);
    const png = await img.body();
    expect([...png.subarray(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
    expect(png.length).toBeGreaterThan(2000);
  });

  test('the area restricts the records: Tasmania only', async ({ request }) => {
    const { species } = await scatterplot(request, box(142, -44, 149, -40));
    const inTasmania = stubPoints.filter(([lat, lon]) => lat >= -44 && lat <= -40 && lon >= 142 && lon <= 149);
    expect(inTasmania.length).toBeGreaterThan(0);
    expect(inTasmania.length).toBeLessThan(stubPoints.length);
    near(species.scatterplotExtents, extentsOf(inTasmania));
  });
});

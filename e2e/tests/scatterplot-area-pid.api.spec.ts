import { test, expect, APIRequestContext } from '@playwright/test';
import { bearer } from './auth';
import { runTask } from './tasks';
import { box, stubPoints, extentsOf } from './stub-data';

// Regression for AtlasOfLivingAustralia/spatial-service#281. A species layer restricted to an area is registered by
// the hub with the area pid as the species wkt, and the task failed with "Unknown geometry type: <pid>". These are
// the task inputs the hub sends in that case.
const tasmania = box(142, -44, 149, -40);

async function uploadArea(request: APIRequestContext, wkt: string) {
  const res = await request.post('/ws/shape/upload/wkt', { headers: await bearer(request), data: { wkt, name: 'e2e pid area', description: 'e2e' } });
  expect(res.status(), await res.text()).toBe(200);
  return String((await res.json()).id);
}

async function scatterplot(request: APIRequestContext, area: unknown[], speciesWkt: string) {
  const { status } = await runTask(request, 'ScatterplotCreate', {
    area,
    species1: { q: ['*:*'], bs: 'http://biocache:8080', name: 'Eucalyptus e2e', wkt: speciesWkt },
    layer: ['el9001', 'el9002'],
    grid: false,
    resolution: '0.5',
  });
  return status;
}

test.describe('species restricted to an area by pid (#281)', () => {
  test('the area pid as species wkt, with the area', async ({ request }) => {
    test.setTimeout(150_000);
    const pid = await uploadArea(request, tasmania);
    const status = await scatterplot(request, [{ pid }], pid);
    expect(status.status, JSON.stringify(status)).toBe(4);
    const species = JSON.parse(status.output.find((o: any) => o.name === 'species').file);
    const inTasmania = stubPoints.filter(([lat, lon]) => lat >= -44 && lat <= -40 && lon >= 142 && lon <= 149);
    expect(species.scatterplotExtents.flat().length).toBe(extentsOf(inTasmania).flat().length);
  });
});

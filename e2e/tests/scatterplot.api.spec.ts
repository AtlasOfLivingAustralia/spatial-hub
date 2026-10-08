import { test, expect, APIRequestContext } from '@playwright/test';
import { bearer } from './auth';

// ScatterplotCreate end to end: species points come from the biocache stub (stack/biocache-stub), environmental values
// from the synthetic grids e2e_temp (el9001) and e2e_rain (el9002), which are linear in lat/lon (stack/fixtures/make-grids.py),
// so the expected sampled values are computed here independently of the code under test.
const temp = (lat: number) => 20 + 0.4 * (lat + 27);
const rain = (lon: number) => 500 + 10 * (lon - 112);

// The stub's records (stack/biocache-stub/stub.py), snapped to 0.25 degree cell centres.
const centre = (lat: number, lon: number): [number, number] => [Math.floor(lat / 0.25) * 0.25 + 0.125, Math.floor(lon / 0.25) * 0.25 + 0.125];
const mod = (a: number, n: number) => ((a % n) + n) % n;
const stubPoints: [number, number][] = [
  ...Array.from({ length: 12 }, (_, i) => centre(-42.0 + mod(0.3 * i, 3.0), 145.0 + 0.2 * i)),
  ...Array.from({ length: 15 }, (_, i) => centre(-30.0 + 0.9 * i, 120.0 + 2.1 * i)),
];
const extentsOf = (pts: [number, number][]) => {
  const t = pts.map(([lat]) => temp(lat)), r = pts.map(([, lon]) => rain(lon));
  return [[Math.min(...t), Math.max(...t)], [Math.min(...r), Math.max(...r)]];
};
const box = (lon1: number, lat1: number, lon2: number, lat2: number) => `POLYGON((${lon1} ${lat1},${lon2} ${lat1},${lon2} ${lat2},${lon1} ${lat2},${lon1} ${lat1}))`;

async function runTask(request: APIRequestContext, name: string, input: Record<string, unknown>) {
  const headers = await bearer(request);
  const res = await request.post('/ws/tasks/create?userId=e2e@example.org&sessionId=e2e', { headers, data: { name, input } });
  expect(res.status(), await res.text()).toBe(200);
  const task = await res.json();
  expect(task.errors, JSON.stringify(task)).toBeUndefined();
  const id = task.id;
  let status: any;
  for (let i = 0; i < 90; i++) {
    status = await (await request.get(`/ws/tasks/status/${id}`)).json();
    if (status.status >= 4) break; // 4 finished, 3 cancelled, 5 error
    await new Promise((r) => setTimeout(r, 1000));
  }
  return { id, status };
}


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

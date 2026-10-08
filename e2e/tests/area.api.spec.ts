import { test, expect, APIRequestContext } from '@playwright/test';
import { bearer } from './auth';

// Areas drawn or uploaded by users. Expected areas come from an independent oracle (spherical formula),
// not from the code under test: they cover the area calculation fixes (cells, multipolygons, holes).
const R = 6371.0088; // km
const rad = (d: number) => (d * Math.PI) / 180;
const rectKm2 = (lat1: number, lat2: number, lon1: number, lon2: number) =>
  R * R * rad(lon2 - lon1) * Math.abs(Math.sin(rad(lat2)) - Math.sin(rad(lat1)));
// a counter-clockwise ring
const rect = (lat1: number, lat2: number, lon1: number, lon2: number) =>
  `(${lon1} ${lat1},${lon2} ${lat1},${lon2} ${lat2},${lon1} ${lat2},${lon1} ${lat1})`;

const created: string[] = [];
async function upload(request: APIRequestContext, wkt: string, name = 'e2e area') {
  const res = await request.post('/ws/shape/upload/wkt', { headers: await bearer(request), data: { wkt, name, description: 'e2e' } });
  expect(res.status(), await res.text()).toBe(200);
  const body = await res.json();
  expect(body.error, 'upload error').toBeUndefined();
  const id = String(body.id);
  created.push(id);
  return id;
}
async function areaKm2(request: APIRequestContext, id: string) {
  const res = await request.get(`/ws/object/${id}`);
  expect(res.status()).toBe(200);
  return (await res.json()).area_km as number;
}
const near = (actual: number, expected: number) => expect(Math.abs(actual - expected) / expected).toBeLessThan(0.01);

test.afterAll(async ({ request }) => {
  for (const id of created) await request.delete(`/ws/shape/upload/${id}`, { headers: await bearer(request) });
});

test.describe('user areas from WKT', () => {
  test('a simple polygon gets its spherical area', async ({ request }) => {
    const id = await upload(request, `POLYGON(${rect(-30, -29, 130, 131)})`);
    near(await areaKm2(request, id), rectKm2(-30, -29, 130, 131));
  });

  test('a polygon with a hole counts the hole out', async ({ request }) => {
    const outer = rect(-30, -26, 130, 134);
    const hole = `(131 -27,131 -29,133 -29,133 -27,131 -27)`; // clockwise inside a counter-clockwise shell
    const id = await upload(request, `POLYGON(${outer},${hole})`);
    near(await areaKm2(request, id), rectKm2(-30, -26, 130, 134) - rectKm2(-29, -27, 131, 133));
  });

  test('a hole drawn in the same direction as the shell is still a hole', async ({ request }) => {
    const outer = rect(-30, -26, 130, 134);
    const hole = `(131 -29,133 -29,133 -27,131 -27,131 -29)`; // counter-clockwise, same as the shell
    const id = await upload(request, `POLYGON(${outer},${hole})`);
    near(await areaKm2(request, id), rectKm2(-30, -26, 130, 134) - rectKm2(-29, -27, 131, 133));
  });

  test('a multipolygon adds its parts (parts separated by ", ")', async ({ request }) => {
    const id = await upload(request, `MULTIPOLYGON((${rect(-30, -29, 130, 131)}), (${rect(-20, -18, 140, 142)}))`);
    near(await areaKm2(request, id), rectKm2(-30, -29, 130, 131) + rectKm2(-20, -18, 140, 142));
  });

  test('a geometry collection keeps every coordinate', async ({ request }) => {
    const id = await upload(request, `GEOMETRYCOLLECTION(POLYGON(${rect(-30, -29, 130, 131)}))`);
    near(await areaKm2(request, id), rectKm2(-30, -29, 130, 131));
  });

  test('the bounding box of a drawn box is the box', async ({ request }) => {
    const id = await upload(request, `POLYGON(${rect(-30, -29, 130, 131)})`);
    const o = await (await request.get(`/ws/object/${id}`)).json();
    expect(o.bbox).toMatch(/130/);
    expect(o.bbox).toMatch(/131/);
    expect(o.bbox).toMatch(/-30/);
    expect(o.bbox).toMatch(/-29/);
  });

  test('the area can be read back as WKT and found by intersecting a point', async ({ request }) => {
    const id = await upload(request, `POLYGON(${rect(-30, -29, 130, 131)})`);
    const wkt = await (await request.get(`/ws/shape/wkt/${id}`)).text();
    expect(wkt).toMatch(/^POLYGON/);
    const hit = await (await request.get('/ws/intersect/cl22/-29.5/130.5')).json();
    expect(hit[0].value).toBe('South Australia');
  });
});

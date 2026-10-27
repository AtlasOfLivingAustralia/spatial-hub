import { test, expect, APIRequestContext } from '@playwright/test';

// Uses the ALA states layer (cl22, stack/postgres/fixtures-states.sql). These checks cover the PostGIS-backed
// reads that the unit/integration suites fixed: object lookup, point-in-polygon, name search, geometry exports.
async function pidOf(request: APIRequestContext, name: string): Promise<string> {
  const res = await request.get('/ws/objects/cl22');
  expect(res.status()).toBe(200);
  const hit = (await res.json()).find((o: any) => o.name === name);
  expect(hit, `object ${name} in cl22`).toBeTruthy();
  return hit.pid;
}

test.describe('contextual layer cl22 (states)', () => {
  test('the layer and its field are listed', async ({ request }) => {
    const fields = await (await request.get('/ws/fields')).json();
    expect(fields.map((f: any) => f.id)).toContain('cl22');
    const layers = await (await request.get('/ws/layers')).json();
    expect(layers.map((l: any) => l.displayname)).toContain('States and Territories');
  });

  test('lists the state objects with bounding boxes', async ({ request }) => {
    const objects = await (await request.get('/ws/objects/cl22')).json();
    expect(objects.map((o: any) => o.name)).toEqual(expect.arrayContaining(['Tasmania', 'Victoria', 'South Australia']));
    for (const o of objects) expect(o.bbox).toMatch(/^POLYGON/);
  });

  test('intersects a point with the state that contains it', async ({ request }) => {
    const res = await request.get('/ws/intersect/cl22/-30/135');
    expect(res.status()).toBe(200);
    expect((await res.json())[0].value).toBe('South Australia');
  });

  test('a point in the ocean has no state', async ({ request }) => {
    const res = await request.get('/ws/intersect/cl22/-20/100');
    expect(res.status()).toBe(200);
    expect((await res.json()).map((r: any) => r.value)).toEqual(['']);
  });

  test('finds an object by name', async ({ request }) => {
    const res = await request.get('/ws/search?q=Tasmania');
    expect(res.status()).toBe(200);
    expect((await res.json()).map((o: any) => o.name)).toContain('Tasmania');
  });

  test('returns the geometry of a state as WKT, KML, GeoJSON and a shapefile', async ({ request }) => {
    const pid = await pidOf(request, 'Tasmania');
    const wkt = await request.get(`/ws/shape/wkt/${pid}`);
    expect(wkt.status()).toBe(200);
    expect(await wkt.text()).toMatch(/^(MULTI)?POLYGON/);

    const kml = await request.get(`/ws/shape/kml/${pid}`);
    expect(kml.status()).toBe(200);
    expect(await kml.text()).toContain('<kml');

    const geojson = await request.get(`/ws/shape/geojson/${pid}`);
    expect(geojson.status()).toBe(200);
    expect((await geojson.json()).type).toMatch(/Polygon|Feature/);

    const shp = await request.get(`/ws/shape/shp/${pid}`);
    expect(shp.status()).toBe(200);
    expect(shp.headers()['content-type']).toMatch(/zip|octet-stream/);
  });

  test('geometry of several objects can be requested in one call', async ({ request }) => {
    const a = await pidOf(request, 'Tasmania');
    const b = await pidOf(request, 'Victoria');
    const res = await request.get(`/ws/shape/wkt/${a}~${b}`);
    expect(res.status()).toBe(200);
    expect(await res.text()).toMatch(/POLYGON/);
  });

  test('the object metadata carries its area', async ({ request }) => {
    const pid = await pidOf(request, 'Tasmania');
    const res = await request.get(`/ws/object/${pid}`);
    expect(res.status()).toBe(200);
    const o = await res.json();
    expect(o.name).toBe('Tasmania');
    expect(o.area_km).toBeGreaterThan(60000);
    expect(o.area_km).toBeLessThan(75000);
  });
});

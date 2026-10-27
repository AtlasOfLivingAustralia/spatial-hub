import { test, expect } from '@playwright/test';
import { runTask } from './tasks';

// Environmental envelope on the synthetic grids (linear in lat/lon, see stack/fixtures/make-grids.py):
// temperature 18..22 is latitude -32..-22 and rainfall 600..800 is longitude 121..141, so the envelope is that box.
// The expected area is computed from the cells the task itself wrote, each in its own latitude band.
const R = 6371.0088;
const rad = (d: number) => (d * Math.PI) / 180;
const boxKm2 = (lat1: number, lat2: number, lon1: number, lon2: number) => R * R * rad(lon2 - lon1) * Math.abs(Math.sin(rad(lat2)) - Math.sin(rad(lat1)));

test('envelope area and its zipped shapefile download', async ({ request }) => {
  const { id, status } = await runTask(request, 'Envelope', { envelope: 'el9001:[18 TO 22],el9002:[600 TO 800]', resolution: '0.5', shp: true });
  expect(status.status, JSON.stringify(status)).toBe(4);

  const out = JSON.parse(status.output.find((o: any) => o.name === 'area')?.file ?? 'null') ?? (() => { throw new Error(JSON.stringify(status)); })();
  // the grid the task wrote (ESRI ascii, north row first): its cells with value 1 are the envelope
  const asc = (await (await request.get(`/ws/tasks/output/${id}/${out.id}.asc`)).text()).split('\n');
  const head = Object.fromEntries(asc.slice(0, 6).map((l) => l.trim().split(/\s+/)).map(([k, v]) => [k, Number(v)]));
  const rows = asc.slice(6).filter((l) => l.trim()).map((l) => l.trim().split(/\s+/).map(Number));
  let areaOracle = 0, cells = 0;
  rows.forEach((row, r) => {
    const south = head.yllcorner + (head.nrows - 1 - r) * head.cellsize;
    const n = row.filter((v) => v === 1).length;
    cells += n;
    areaOracle += n * boxKm2(south, south + head.cellsize, 0, head.cellsize);
  });
  // the envelope is the box lat -32..-22, lon 121..141 up to the grid's half-cell alignment (20 x 40 cells of 0.5 degrees)
  expect(cells).toBeGreaterThan(0.9 * 20 * 40);
  expect(cells).toBeLessThanOrEqual(20 * 40);
  // area_km is the sum of the spherical areas of those cells (each cell in its own latitude band)
  expect(Math.abs(out.area_km - areaOracle) / areaOracle, `area ${out.area_km} vs ${Math.round(areaOracle)}`).toBeLessThan(0.005);

  const zip = await request.get(`/ws/shape/shp/ENVELOPE${id}`);
  expect(zip.status()).toBe(200);
  const body = await zip.body();
  expect(body.subarray(0, 2).toString()).toBe('PK');
  for (const f of ['envelope.shp', 'envelope.shx', 'envelope.dbf']) expect(body.includes(Buffer.from(f)), f).toBe(true);
});

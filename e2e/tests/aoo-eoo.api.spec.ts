import { test, expect } from '@playwright/test';
import { runTask } from './tasks';
import { stubPoints, box } from './stub-data';

// AooEoo on the stub's records. Oracles are computed here: AOO from the set of grid cells holding a record
// (cells are floor(x / res) * res, also for negative coordinates), EOO from the convex hull of the records.
const R = 6371.0088; // km
const rad = (d: number) => (d * Math.PI) / 180;
// convex hull (monotone chain) over [lon, lat]
function hull(pts: [number, number][]) {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const build = (arr: [number, number][]) => { const h: [number, number][] = []; for (const q of arr) { while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], q) <= 0) h.pop(); h.push(q); } h.pop(); return h; };
  return [...build(p), ...build([...p].reverse())];
}
// area of a spherical polygon with great-circle edges (what the service computes): sum of spherical triangle
// excesses from the first vertex, Van Oosterom & Strackee: tan(E/2) = a.(b x c) / (1 + a.b + b.c + c.a)
function areaKm2(ring: [number, number][]) {
  const v = ([lon, lat]: number[]) => [Math.cos(rad(lat)) * Math.cos(rad(lon)), Math.cos(rad(lat)) * Math.sin(rad(lon)), Math.sin(rad(lat))];
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const a = v(ring[0]);
  let excess = 0;
  for (let i = 1; i < ring.length - 1; i++) {
    const b = v(ring[i]), c = v(ring[i + 1]);
    excess += 2 * Math.atan2(dot(a, cross(b, c)), 1 + dot(a, b) + dot(b, c) + dot(c, a));
  }
  return Math.abs(excess) * R * R;
}

test('AOO and EOO of the stub species', async ({ request }) => {
  // 0.125 divides every stub record's coordinates, so each record sits exactly on a cell corner: the case that went wrong for negative coordinates
  const res = 0.125;
  const { id, status } = await runTask(request, 'AooEoo', {
    area: [{ type: 'wkt', wkt: box(112, -44, 154, -10), name: 'e2e aoo area' }],
    species: { q: ['*:*'], bs: 'http://biocache:8080', name: 'Eucalyptus e2e' },
    resolution: res, coverage: 2, radius: 5000,
  });
  expect(status.status, JSON.stringify(status)).toBe(4);

  const cells = new Set(stubPoints.map(([lat, lon]) => `${Math.floor(lat / res)},${Math.floor(lon / res)}`));
  const html = await (await request.get(`/ws/tasks/output/${id}/Calculated%20AOO%20and%20EOO.html`)).text();
  const cell = (label: RegExp) => Number(html.match(label)![1]);
  expect(cell(/Number of records used for the calculations<\/td><td>(\d+)/)).toBe(stubPoints.length);
  expect(cell(/AOO: [\d.]+ degree grid\)<\/td><td>(\d+) sq km/)).toBe(Math.round(res * res * cells.size * 10000));

  // the AOO polygon is made of exactly the cells that hold records; a cell is floor(x / res) * res, also when x < 0
  const aooWkt = await (await request.get(`/ws/tasks/output/${id}/Area%20of%20occupancy.wkt`)).text();
  const key = (lon: number, lat: number) => `${lon.toFixed(3)},${lat.toFixed(3)}`;
  const gotCells = new Set([...aooWkt.matchAll(/\(([^()]+)\)/g)].map((m) => {
    const xy = m[1].split(',').map((p) => p.trim().split(/\s+/).map(Number));
    return key(Math.min(...xy.map((c) => c[0])), Math.min(...xy.map((c) => c[1])));
  }));
  const wantCells = new Set(stubPoints.map(([lat, lon]) => key(Math.floor(lon / res) * res, Math.floor(lat / res) * res)));
  expect([...gotCells].sort()).toEqual([...wantCells].sort());

  const eooExpected = areaKm2(hull(stubPoints.map(([lat, lon]) => [lon, lat])));
  const eoo = cell(/Minimum convex hull\)<\/td><td>(\d+) sq km/);
  expect(Math.abs(eoo - eooExpected) / eooExpected, `EOO ${eoo} vs ${Math.round(eooExpected)}`).toBeLessThan(0.02);
});

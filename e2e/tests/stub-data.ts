// Mirrors stack/biocache-stub/stub.py so tests can compute expectations independently.
const temp = (lat: number) => 20 + 0.4 * (lat + 27);
const rain = (lon: number) => 500 + 10 * (lon - 112);
// The stub's records (stack/biocache-stub/stub.py), snapped to 0.25 degree cell centres.
export const centre = (lat: number, lon: number): [number, number] => [Math.floor(lat / 0.25) * 0.25 + 0.125, Math.floor(lon / 0.25) * 0.25 + 0.125];
const mod = (a: number, n: number) => ((a % n) + n) % n;
export const stubPoints: [number, number][] = [
  ...Array.from({ length: 12 }, (_, i) => centre(-42.0 + mod(0.3 * i, 3.0), 145.0 + 0.2 * i)),
  ...Array.from({ length: 15 }, (_, i) => centre(-30.0 + 0.9 * i, 120.0 + 2.1 * i)),
];
export const extentsOf = (pts: [number, number][]) => {
  const t = pts.map(([lat]) => temp(lat)), r = pts.map(([, lon]) => rain(lon));
  return [[Math.min(...t), Math.max(...t)], [Math.min(...r), Math.max(...r)]];
};
export const box = (lon1: number, lat1: number, lon2: number, lat2: number) => `POLYGON((${lon1} ${lat1},${lon2} ${lat1},${lon2} ${lat2},${lon1} ${lat2},${lon1} ${lat1}))`;


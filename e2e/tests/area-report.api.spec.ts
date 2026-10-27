import { test, expect } from '@playwright/test';
import { runTask } from './tasks';
import { box } from './stub-data';

// AreaReport task and its PDF. The biocache stub has no JournalMap articles, so the report contains a table without
// rows: that used to make the whole PDF fail (a row with one cell under a six column header).
test('area report task produces a PDF', async ({ request }) => {
  test.setTimeout(420_000);
  const { id, status } = await runTask(request, 'AreaReport', { area: [{ type: 'wkt', wkt: box(142, -44, 149, -40), name: 'Tasmania box' }] }, 400);
  expect(status.status, JSON.stringify(status.history)).toBe(4);
  const pdf = await request.get(`/ws/process/areaReport/${id}`, { timeout: 120_000 });
  expect(pdf.status(), 'PDF request').toBe(200);
  const body = await pdf.body();
  expect(body.subarray(0, 4).toString()).toBe('%PDF');
  expect(body.length).toBeGreaterThan(20_000);
});

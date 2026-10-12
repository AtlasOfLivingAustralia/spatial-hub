import { test, expect } from '@playwright/test';
import { runTask } from './tasks';
import { box } from './stub-data';

// Predict (Maxent) end to end on the stub points and the synthetic grids. Maxent is a separate jar that is not
// redistributed here: put it in the service data dir (<data.dir>/modelling/maxent/maxent.jar, mount it in
// stack/docker-compose.yml) and run with E2E_MAXENT=1. Without it the task cannot run, so the spec is skipped.
test.skip(!process.env.E2E_MAXENT, 'needs maxent.jar in the service data dir (set E2E_MAXENT=1)');

test('predict with Maxent finishes and returns the model outputs', async ({ request }) => {
  test.setTimeout(300_000);
  const { status } = await runTask(
    request,
    'Maxent',
    {
      area: [{ type: 'wkt', wkt: box(112, -44, 154, -10), name: 'e2e maxent area' }],
      species: { q: ['*:*'], bs: 'http://biocache:8080', name: 'Eucalyptus e2e' },
      layer: 'el9001,el9002',
      resolution: '0.5',
      jackknife: false,
      responseCurves: false,
      testPercentage: 0,
    },
    240,
  );
  expect(status.status, JSON.stringify(status)).toBe(4);
  expect(status.output.map((o: any) => o.name)).toEqual(expect.arrayContaining(['files']));
});

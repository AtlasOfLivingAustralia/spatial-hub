import { test, expect } from '@playwright/test';
import { runTask } from './tasks';
import { box } from './stub-data';

// Predict (Maxent) end to end on the stub points and the synthetic grids. maxent.jar is not redistributed here: the
// stack's maxent-init service downloads it (like ala-install does) into <data.dir>/modelling/maxent. That needs network,
// so the spec only runs with E2E_MAXENT=1. Maxent 3.4.3 (ala-install's default) fails on these inputs with
// "ClassCastException: [D cannot be cast to [F"; the stack uses 3.4.4 (MAXENT_VERSION=3.4.3 reproduces the failure).
test.skip(!process.env.E2E_MAXENT, 'needs maxent.jar in the service data dir (set E2E_MAXENT=1)');

test('predict with Maxent finishes and returns the model outputs', async ({ request }) => {
  test.setTimeout(300_000);
  const { status } = await runTask(
    request,
    'Maxent',
    {
      area: [{ type: 'wkt', wkt: box(112, -44, 154, -10), name: 'e2e maxent area' }],
      species: { q: ['*:*'], bs: 'http://biocache:8080', name: 'Eucalyptus e2e' },
      layer: ['el9001', 'el9002'],
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

import { test, expect } from '@playwright/test';

// Smoke checks of the three pieces behind the hub: spatial-service (/ws), GeoServer and the hub itself.
test.describe('stack', () => {
  test('spatial-service lists layers as JSON', async ({ request }) => {
    const res = await request.get('/ws/layers');
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  test('spatial-service lists fields as JSON', async ({ request }) => {
    const res = await request.get('/ws/fields');
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  test('GeoServer publishes the Objects layer in the ALA workspace', async ({ request }) => {
    const res = await request.get('/geoserver/ALA/wms?service=WMS&version=1.1.1&request=GetCapabilities');
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain('<Name>Objects</Name>');
  });

  test('task capabilities are listed', async ({ request }) => {
    const res = await request.get('/ws/tasks/capabilities');
    expect(res.status()).toBe(200);
    expect(Object.keys(await res.json()).length).toBeGreaterThan(0);
  });
});

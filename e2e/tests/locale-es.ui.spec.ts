import { test, expect, Page } from '@playwright/test';
import { login } from './login';
import { shot } from './shots';
import * as fs from 'fs';

// Walks the hub's menus and dialogs with a Spanish browser and collects the visible texts; reports the ones that look English.
test.use({ locale: 'es' });

const visibleTexts = (page: Page) =>
  page.evaluate(() => {
    const out = new Set<string>();
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const t = (n.textContent || '').replace(/\s+/g, ' ').trim();
      const el = n.parentElement;
      if (!t || !el || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      if (r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none') out.add(t);
    }
    return [...out];
  });

test('inventory of visible texts per screen (es)', async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  await login(page);
  const inventory: Record<string, string[]> = { home: await visibleTexts(page) };
  const menus = page.locator("button[testTag='menu']");
  const menuNames = (await menus.allInnerTexts()).map((t) => t.trim());
  for (const menu of menuNames) {
    await page.locator("button[testTag='menu']", { hasText: menu }).first().click();
    const items = (await page.locator("ul li a[testTag='menuItem']:visible").allInnerTexts()).map((t) => t.trim());
    inventory['menu: ' + menu] = items;
    await page.keyboard.press('Escape');
    for (const item of items) {
      await page.locator("button[testTag='menu']", { hasText: menu }).first().click();
      await page.locator("ul li a[testTag='menuItem']:visible", { hasText: item }).first().click();
      await page.waitForTimeout(1500);
      inventory[`${menu} > ${item}`] = await visibleTexts(page);
      await shot(page, testInfo, `${menu} > ${item}`);
      await page.reload();
      await page.waitForSelector('.leaflet-container');
    }
  }
  fs.writeFileSync(testInfo.outputPath('inventory.json'), JSON.stringify(inventory, null, 1));
  fs.writeFileSync('/tmp/claude-1000/inventory-es.json', JSON.stringify(inventory, null, 1));
  expect(Object.keys(inventory).length).toBeGreaterThan(5);
});

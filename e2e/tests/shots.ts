import { Page, TestInfo } from '@playwright/test';

// Attach a screenshot to the report at a named step, so a green test can be checked against what the browser showed.
export async function shot(page: Page, testInfo: TestInfo, name: string) {
  await testInfo.attach(name, { body: await page.screenshot(), contentType: 'image/png' });
}

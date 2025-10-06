import { test, expect } from '@playwright/test';

const routes = [
  { name: 'bridge-overview', path: '/' },
  { name: 'orbital-node', path: '/orbital' },
  { name: 'etl-factory', path: '/etl' },
  { name: 'chrono-4d', path: '/chrono' },
  { name: 'reality-sim', path: '/simulator' },
  { name: 'analytics-deck', path: '/analytics' },
  { name: 'ai-self-improve', path: '/self-improve' },
  { name: 'agents-panel', path: '/agents' }
];

test.describe('DEV parity visual tests', () => {
  for (const route of routes) {
    test(`page-${route.name} matches snapshot`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForTimeout(1000);
      const screenshot = await page.screenshot({ fullPage: true });
      expect(screenshot).toMatchSnapshot(`${route.name}.png`, { maxDiffPixels: Math.floor(0.01 * 1440 * 900) });
    });
  }
});



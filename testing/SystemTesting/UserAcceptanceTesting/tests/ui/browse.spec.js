// tests/ui/browse.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Catalog & Search', () => {
  test('Search returns expected results and apply filter', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[aria-label="Search"]', 'JavaScript');
    await page.keyboard.press('Enter');
    await expect(page.locator('.book-card')).toHaveCountGreaterThan(0);

    // Apply filter (example: genre)
    await page.click('text=Filters');
    await page.check('input[name="genre"][value="Programming"]');
    await page.click('text=Apply');
    await expect(page.locator('.book-card')).toHaveCountGreaterThan(0);
  });
});

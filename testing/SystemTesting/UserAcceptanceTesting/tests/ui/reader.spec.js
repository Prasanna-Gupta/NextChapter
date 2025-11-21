// tests/ui/reader.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Reader & Reading flows', () => {
  test('Open book, bookmark, highlight, continue reading', async ({ page }) => {
    await page.goto('/');
    // click first book
    await page.click('.book-card >> nth=0');
    await expect(page.locator('text=Read Now')).toBeVisible();
    await page.click('text=Read Now');

    // Confirm reader loaded
    await expect(page.locator('.reader')).toBeVisible();

    // Add bookmark
    await page.click('button[aria-label="Add Bookmark"]');
    await expect(page.locator('.toast')).toContainText('Bookmark');

    // Highlight a selection (approximate)
    await page.evaluate(() => {
      const p = document.querySelector('.reader p');
      const range = document.createRange();
      range.setStart(p.firstChild, 0);
      range.setEnd(p.firstChild, Math.min(20, p.firstChild.length));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });
    await page.click('button[aria-label="Highlight"]');
    await expect(page.locator('.highlight')).toHaveCountGreaterThan(0);

    // Close reader and check continue reading shows progress
    await page.click('button[aria-label="Close Reader"]');
    await expect(page.locator('text=Continue Reading')).toBeVisible();
  });
});

// tests/ui/auth.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Auth flows', () => {
  test('Register, login, logout', async ({ page, baseURL }) => {
    const base = process.env.BASE_URL || baseURL;

    await page.goto('/register'); // relative to baseURL
    await page.fill('input[name="name"]', 'UAT Reader');
    await page.fill('input[name="email"]', process.env.READER_EMAIL || 'reader@test.com');
    await page.fill('input[name="password"]', process.env.READER_PASSWORD || 'Reader@123');
    await page.click('button[type="submit"]');

    // Expect success redirect or toast
    await expect(page).toHaveURL(/dashboard|home/);

    // Logout
    await page.click('button[aria-label="account-menu"]');
    await page.click('text=Logout');
    await expect(page).toHaveURL(/login/);

    // Login again
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.READER_EMAIL || 'reader@test.com');
    await page.fill('input[name="password"]', process.env.READER_PASSWORD || 'Reader@123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
});

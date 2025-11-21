// tests/ui/admin.spec.js
const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Admin panel', () => {
  test('Admin can add book with file upload (use uploaded PDF)', async ({ page }) => {
    // login as admin
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', process.env.ADMIN_EMAIL || 'admin@test.com');
    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD || 'Admin@123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/admin/);

    // navigate to add book
    await page.goto('/admin/books/new');

    await page.fill('input[name="title"]', 'UAT Upload Book');
    await page.fill('input[name="author"]', 'Test Author');
    await page.fill('input[name="price"]', '0');

    // Upload cover or pdf using the uploaded file path:
    const uploadPath = process.env.UPLOAD_FILE_PATH || '/mnt/data/SoftwareEngineeringProject_MidEvaluation.pdf';
    const fileInput = await page.waitForSelector('input[type="file"]');
    await fileInput.setInputFiles(uploadPath);

    await page.click('button[type="submit"]');

    // Expect success message and the new book appears in list
    await expect(page.locator('.toast')).toContainText('Book added');
    await expect(page.locator('.book-list >> text=UAT Upload Book')).toBeVisible();
  });
});

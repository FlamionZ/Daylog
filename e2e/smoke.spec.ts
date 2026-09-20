import { test, expect } from '@playwright/test';

test('smoke: login page renders', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText('Internship Companion')).toBeVisible();
});

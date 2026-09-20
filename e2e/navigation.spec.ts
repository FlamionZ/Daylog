import { test, expect } from '@playwright/test';

test.describe('Route Protection & Navigation', () => {
  const protectedRoutes = [
    '/dashboard',
    '/attendance',
    '/tasks',
    '/journals',
    '/learnings',
    '/reports',
    '/documents',
    '/settings',
  ];

  for (const route of protectedRoutes) {
    test(`unauthenticated visit to ${route} redirects to /login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});

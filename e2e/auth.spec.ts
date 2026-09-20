import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('login page renders with branding, title, and tabs', async ({ page }) => {
    await page.goto('/login');

    // Title and branding
    await expect(page.getByRole('heading', { name: 'Internship Companion' })).toBeVisible();
    await expect(page.getByText('Masuk ke akun untuk mengelola aktivitas magang')).toBeVisible();

    // Tabs
    await expect(page.getByRole('tab', { name: 'Kata Sandi' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Magic Link' })).toBeVisible();

    // Form inputs
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Kata Sandi')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Masuk dengan Email' })).toBeVisible();

    // Disclaimer
    await expect(page.getByText('Aplikasi pendamping pribadi mandiri')).toBeVisible();
  });

  test('login page validation on empty submit', async ({ page }) => {
    await page.goto('/login');

    // Click submit without entering values
    await page.getByRole('button', { name: 'Masuk dengan Email' }).click();

    // Expect validation errors
    await expect(page.getByText('Email tidak valid')).toBeVisible();
  });

  test('switches to magic link tab', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('tab', { name: 'Magic Link' }).click();
    await expect(page.getByRole('button', { name: 'Kirim Magic Link' })).toBeVisible();
  });
});

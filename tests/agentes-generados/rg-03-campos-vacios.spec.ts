// spec: specs/regression-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('RG-03 Campos vacios', async ({ page }) => {
    // 1. Ir a /auth/login y enviar sin completar.
    await page.goto('/auth/login');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('email-error')).toHaveText('Email is required');
    await expect(page.getByTestId('password-error')).toHaveText('Password is required');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});

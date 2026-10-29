// spec: specs/agentes-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Auth', () => {
  test('RG-03 Login con campos vacios muestra validaciones requeridas', async ({ page }) => {
    // 1. Ir a /auth/login y click en login-submit sin completar campos
    await page.goto('/auth/login');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('email-error')).toHaveText('Email is required');
    await expect(page.getByTestId('password-error')).toHaveText('Password is required');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });
});

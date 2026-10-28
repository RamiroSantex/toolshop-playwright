// spec: specs/regression-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('RG-04 Ruta protegida sin sesion', async ({ page }) => {
    // 1. Ir directo a /account sin sesion.
    await page.goto('/account');

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByTestId('login-form')).toBeVisible();
  });
});

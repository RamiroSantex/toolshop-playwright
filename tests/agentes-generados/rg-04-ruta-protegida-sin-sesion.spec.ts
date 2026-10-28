// spec: specs/agentes-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Auth', () => {
  test('RG-04 Acceder a /account sin sesion redirige a /auth/login', async ({ page }) => {
    // 1. Con contexto limpio navegar directo a /account
    await page.goto('/account');

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByTestId('login-submit')).toBeVisible();
    await expect(page.getByTestId('page-title')).toHaveCount(0);
  });
});

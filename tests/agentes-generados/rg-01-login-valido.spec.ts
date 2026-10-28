// spec: specs/regression-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('RG-01 Login valido', async ({ page }) => {
    // 1. Ir a /auth/login.
    await page.goto('/auth/login');

    // 2. Completar email y password validos y enviar.
    await page.getByTestId('email').fill('customer@practicesoftwaretesting.com');
    await page.getByTestId('password').fill('welcome01');
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByTestId('page-title')).toHaveText('My account');
    await expect(page.getByTestId('nav-menu')).toHaveText('Jane Doe');
    await expect(page.getByTestId('nav-sign-in')).toBeHidden();
  });
});

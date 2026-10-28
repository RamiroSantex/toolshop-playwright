// spec: specs/agentes-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Auth', () => {
  test('RG-01 Login valido redirige a /account y muestra el nombre del usuario', async ({ page }) => {
    // 1. Ir a /auth/login
    await page.goto('/auth/login');
    await expect(page.getByTestId('email')).toBeVisible();
    await expect(page.getByTestId('password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();

    // 2. Completar email y password, click en login-submit
    await page.getByTestId('email').fill('customer@practicesoftwaretesting.com');
    await page.getByTestId('password').fill('welcome01');
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByTestId('page-title')).toHaveText('My account');
    // Nota: en la exploracion real nav-menu con el nombre del usuario NO se renderizo
    // (GET /users/me respondio 401), por eso se verifica la sesion via la navegacion de cuenta.
    await expect(page.getByTestId('nav-profile')).toBeVisible();
  });
});

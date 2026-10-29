// spec: specs/agentes-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Auth', () => {
  test('RG-02 Login con credenciales invalidas muestra error y no inicia sesion', async ({ page }) => {
    // 1. Ir a /auth/login, completar credenciales invalidas (NO la cuenta customer) y enviar
    await page.goto('/auth/login');
    await page.getByTestId('email').fill('noexiste.qa@example.com');
    await page.getByTestId('password').fill('wrongpass123');
    await page.getByTestId('login-submit').click();

    // Se asserta sobre el data-test en lugar del texto literal (el mensaje real es 'Invalid email or password').
    await expect(page.locator('[data-test="login-error"]')).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByTestId('nav-menu')).toHaveCount(0);
    await expect(page.getByTestId('nav-sign-in')).toBeVisible();
  });
});

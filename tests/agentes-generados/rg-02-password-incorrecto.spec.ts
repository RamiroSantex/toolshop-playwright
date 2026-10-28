// spec: specs/regression-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('RG-02 Password incorrecto', async ({ page }) => {
    // 1. Ir a /auth/login, email + password incorrecto, enviar.
    // Adaptacion: se usa un usuario inexistente para no golpear ni bloquear la cuenta real (HTTP 423).
    await page.goto('/auth/login');
    await page.getByTestId('email').fill('no-existe@example.com');
    await page.getByTestId('password').fill('password-incorrecto');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByTestId('nav-menu')).toBeHidden();
  });
});

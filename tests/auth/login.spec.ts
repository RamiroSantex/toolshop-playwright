import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CUSTOMER } from '../support/users';


test.describe('Login', () => {
  test('RG-01 login valido redirige a /account y muestra el nombre del usuario', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(CUSTOMER.email, CUSTOMER.password);

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByTestId('page-title')).toHaveText('My account');
    await expect(page.getByTestId('nav-menu')).toHaveText(CUSTOMER.name);
    await expect(page.getByTestId('nav-sign-in')).toBeHidden();
  });

  // Se usa un email inexistente a proposito: la app BLOQUEA la cuenta (HTTP 423) tras varios intentos fallidos
  // contra un usuario real, y customer@... es compartido por toda la suite. Ver docs/verificacion-fallos.md.
  test('RG-02 credenciales invalidas muestran error y no inician sesion', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('no-existe@example.com', 'password-incorrecto');

    await expect(login.loginError).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByTestId('nav-menu')).toBeHidden();
  });

  test('RG-03 campos vacios muestran validaciones de requeridos', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.submitEmpty();

    await expect(login.emailError).toHaveText('Email is required');
    await expect(login.passwordError).toHaveText('Password is required');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('RG-04 /account sin sesion redirige a /auth/login', async ({ page }) => {
    await page.goto('/account');

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(new LoginPage(page).form).toBeVisible();
  });
});

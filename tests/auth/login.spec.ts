import { test, expect } from '@playwright/test';

const CUSTOMER = { email: 'customer@practicesoftwaretesting.com', password: 'welcome01' };

test.describe('Login', () => {
  test('RG-01 login valido redirige a /account y muestra el nombre del usuario', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByTestId('email').fill(CUSTOMER.email);
    await page.getByTestId('password').fill(CUSTOMER.password);
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByTestId('page-title')).toHaveText('My account');
    await expect(page.getByTestId('nav-menu')).toHaveText('Jane Doe');
    await expect(page.getByTestId('nav-sign-in')).toBeHidden();
  });

  test('RG-02 password incorrecto muestra error y no inicia sesion', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByTestId('email').fill(CUSTOMER.email);
    await page.getByTestId('password').fill('password-incorrecto');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByTestId('nav-menu')).toBeHidden();
  });

  test('RG-03 campos vacios muestran validaciones de requeridos', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('email-error')).toHaveText('Email is required');
    await expect(page.getByTestId('password-error')).toHaveText('Password is required');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('RG-04 /account sin sesion redirige a /auth/login', async ({ page }) => {
    await page.goto('/account');

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByTestId('login-form')).toBeVisible();
  });
});

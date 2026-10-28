// spec: specs/regression-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Carrito - edicion', () => {
  test('RG-09 Eliminar producto', async ({ page }) => {
    // 1. Agregar 1x Combination Pliers.
    await page.goto('/');
    await expect(page.getByTestId('product-name').first()).toBeVisible();
    const search = page.waitForResponse((r) => r.url().includes('/products/search') && r.ok());
    await page.getByTestId('search-query').fill('Combination Pliers');
    await page.getByTestId('search-submit').click();
    await search;
    await page.getByTestId('product-name').filter({ hasText: 'Combination Pliers' }).first().click();
    await expect(page.getByTestId('product-name')).toHaveText('Combination Pliers');
    await page.getByTestId('add-to-cart').click();
    await expect(page.getByTestId('nav-cart')).toHaveText('1');

    // 2. Ir a /checkout, eliminar la linea.
    await page.goto('/checkout');
    await expect(page.getByTestId('product-title')).toHaveText('Combination Pliers');
    await page.locator('tr', { hasText: 'Combination Pliers' }).locator('.btn-danger').click();

    await expect(page.getByTestId('product-title')).toHaveCount(0);
    await expect(page.getByText('The cart is empty')).toBeVisible();
    await expect(page.getByTestId('nav-cart')).toBeHidden();
  });
});

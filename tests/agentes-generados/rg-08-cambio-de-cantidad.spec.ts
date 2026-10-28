// spec: specs/regression-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

const money = (text: string | null) => Number((text ?? '').replace(/[^0-9.]/g, ''));
const fmt = (n: number) => `$${n.toFixed(2)}`;

test.describe('Carrito - edicion', () => {
  test('RG-08 Cambio de cantidad', async ({ page }) => {
    // 1. Agregar 1x Combination Pliers.
    await page.goto('/');
    await expect(page.getByTestId('product-name').first()).toBeVisible();
    const search = page.waitForResponse((r) => r.url().includes('/products/search') && r.ok());
    await page.getByTestId('search-query').fill('Combination Pliers');
    await page.getByTestId('search-submit').click();
    await search;
    await page.getByTestId('product-name').filter({ hasText: 'Combination Pliers' }).first().click();
    await expect(page.getByTestId('product-name')).toHaveText('Combination Pliers');
    const price = money(await page.getByTestId('unit-price').textContent());
    await page.getByTestId('add-to-cart').click();
    await expect(page.getByTestId('nav-cart')).toHaveText('1');

    // 2. Ir a /checkout y cambiar la cantidad a 4.
    await page.goto('/checkout');
    await expect(page.getByTestId('cart-total')).toHaveText(fmt(price));

    const qty = page.getByTestId('product-quantity');
    const update = page.waitForResponse((r) => r.url().includes('/carts/') && r.request().method() === 'PUT');
    await qty.fill('4');
    await qty.blur();
    await update;

    await expect(page.getByTestId('line-price')).toHaveText(fmt(4 * price));
    await expect(page.getByTestId('cart-total')).toHaveText(fmt(4 * price));
    await expect(page.getByTestId('nav-cart')).toHaveText('4');
  });
});

// spec: specs/regression-plan.md
// seed: tests/seed.spec.ts
import { test, expect, Page } from '@playwright/test';

const money = (text: string | null) => Number((text ?? '').replace(/[^0-9.]/g, ''));
const fmt = (n: number) => `$${n.toFixed(2)}`;

// Busca el producto por nombre, abre su ficha, sube la cantidad, lo agrega y devuelve el precio unitario de la ficha.
async function addProduct(page: Page, name: string, quantity: number, unitsInCartAfter: number) {
  await page.goto('/');
  await expect(page.getByTestId('product-name').first()).toBeVisible();
  const search = page.waitForResponse((r) => r.url().includes('/products/search') && r.ok());
  await page.getByTestId('search-query').fill(name);
  await page.getByTestId('search-submit').click();
  await search;
  await page.getByTestId('product-name').filter({ hasText: name }).first().click();
  await expect(page.getByTestId('product-name')).toHaveText(name);
  const unitPrice = money(await page.getByTestId('unit-price').textContent());
  for (let i = 1; i < quantity; i++) await page.getByTestId('increase-quantity').click();
  await expect(page.getByTestId('quantity')).toHaveValue(String(quantity));
  await page.getByTestId('add-to-cart').click();
  await expect(page.getByTestId('nav-cart')).toHaveText(String(unitsInCartAfter));
  return unitPrice;
}

test.describe('Carrito - totales', () => {
  test('RG-07 Total del carrito', async ({ page }) => {
    // 1. Agregar 2x Combination Pliers y 3x Slip Joint Pliers (precio unitario leido de cada ficha).
    const priceA = await addProduct(page, 'Combination Pliers', 2, 2);
    const priceB = await addProduct(page, 'Slip Joint Pliers', 3, 5);

    // 2. Abrir /checkout.
    await page.goto('/checkout');
    await expect(page.getByTestId('product-title')).toHaveCount(2);

    const rows = page.locator('table tr');
    await expect(rows.filter({ hasText: 'Combination Pliers' }).getByTestId('line-price')).toHaveText(fmt(2 * priceA));
    await expect(rows.filter({ hasText: 'Slip Joint Pliers' }).getByTestId('line-price')).toHaveText(fmt(3 * priceB));
    await expect(page.getByTestId('cart-total')).toHaveText(fmt(2 * priceA + 3 * priceB));
    await expect(page.getByTestId('nav-cart')).toHaveText('5');
  });
});

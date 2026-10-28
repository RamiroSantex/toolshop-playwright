// spec: specs/agentes-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

const API = 'https://api.practicesoftwaretesting.com';

test.describe('Carrito', () => {
  test('RG-08 Cambiar la cantidad recalcula linea, total y badge', async ({ page, request }) => {
    // 1. Agregar un producto con stock y abrir el carrito
    const res = await request.get(`${API}/products`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const product = body.data.find(
      (p: { in_stock: boolean; is_rental: boolean }) => p.in_stock && !p.is_rental,
    );
    const unitPrice: number = product.price;

    await page.goto(`/product/${product.id}`);
    await expect(page.getByTestId('add-to-cart')).toBeVisible();
    await page.getByTestId('add-to-cart').click();
    await expect(page.getByTestId('cart-quantity')).toHaveText('1');
    await page.getByTestId('nav-cart').click();

    await expect(page.getByTestId('product-quantity')).toHaveValue('1');
    await expect(page.getByTestId('cart-total')).toHaveText(`$${unitPrice.toFixed(2)}`);

    // 2. Cambiar product-quantity a 3 y salir del campo
    await page.getByTestId('product-quantity').fill('3');
    await page.getByTestId('product-quantity').blur();

    const expectedTotal = `$${(unitPrice * 3).toFixed(2)}`;
    await expect(page.getByTestId('line-price')).toHaveText(expectedTotal);
    await expect(page.getByTestId('cart-total')).toHaveText(expectedTotal);
    await expect(page.getByTestId('cart-quantity')).toHaveText('3');
  });
});

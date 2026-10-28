// spec: specs/agentes-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

const API = 'https://api.practicesoftwaretesting.com';

test.describe('Carrito', () => {
  test('RG-07 Total del carrito = suma de cantidad x precio unitario', async ({ page, request }) => {
    // 1. Obtener de GET /products dos productos con stock y agregarlos (2 unidades y 1 unidad)
    const res = await request.get(`${API}/products`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const [first, second] = body.data.filter(
      (p: { in_stock: boolean; is_rental: boolean }) => p.in_stock && !p.is_rental,
    );

    await page.goto(`/product/${first.id}`);
    await expect(page.getByTestId('add-to-cart')).toBeVisible();
    await page.getByTestId('increase-quantity').click();
    await expect(page.getByTestId('quantity')).toHaveValue('2');
    await page.getByTestId('add-to-cart').click();
    await expect(page.getByTestId('cart-quantity')).toHaveText('2');

    await page.goto(`/product/${second.id}`);
    await expect(page.getByTestId('add-to-cart')).toBeVisible();
    await page.getByTestId('add-to-cart').click();
    await expect(page.getByTestId('cart-quantity')).toHaveText('3');

    // 2. Ir a nav-cart
    await page.getByTestId('nav-cart').click();
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByTestId('product-price')).toHaveCount(2);
    await expect(page.getByTestId('product-quantity')).toHaveCount(2);

    const prices = (await page.getByTestId('product-price').allTextContents()).map((t) =>
      parseFloat(t.replace(/[^0-9.]/g, '')),
    );
    const quantities = await page.getByTestId('product-quantity').evaluateAll((els) =>
      els.map((e) => Number((e as HTMLInputElement).value)),
    );
    const expected = prices.reduce((sum, price, i) => sum + price * quantities[i], 0);

    await expect(page.getByTestId('cart-total')).toHaveText(`$${expected.toFixed(2)}`);
  });
});

// spec: specs/agentes-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

const API = process.env.API_URL ?? 'https://api.practicesoftwaretesting.com';

test.describe('Carrito', () => {
  test('RG-09 Eliminar el unico producto deja el carrito vacio', async ({ page, request }) => {
    // 1. Agregar un producto con stock, ir al carrito y eliminar la linea
    const res = await request.get(`${API}/products`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const product = body.data.find(
      (p: { in_stock: boolean; is_rental: boolean }) => p.in_stock && !p.is_rental,
    );

    await page.goto(`/product/${product.id}`);
    await expect(page.getByTestId('add-to-cart')).toBeVisible();
    await page.getByTestId('add-to-cart').click();
    await expect(page.getByTestId('cart-quantity')).toHaveText('1');
    await page.getByTestId('nav-cart').click();
    await expect(page).toHaveURL(/\/checkout$/);

    await page.locator('table a.btn-danger').click();

    await expect(page.getByRole('alert').filter({ hasText: 'Product deleted.' })).toBeVisible();
    await expect(page.locator('table')).toHaveCount(0);
    await expect(page.getByText('The cart is empty. Nothing to display.')).toBeVisible();
    await expect(page.getByTestId('cart-quantity')).toHaveCount(0);
    await expect(page.getByTestId('proceed-1')).toHaveCount(0);
  });
});

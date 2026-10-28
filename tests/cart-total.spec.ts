import { test, expect } from '@playwright/test';
import { addToCart, fmt, pickInStockProducts } from './support/cart';

test.describe('Carrito - totales', () => {
  test('RG-07 el total del carrito es la suma de cantidad x precio unitario de cada producto', async ({ page, request }) => {
    const [a, b] = await pickInStockProducts(request, 2);
    // El precio esperado se lee de la ficha de cada producto (oraculo independiente del carrito).
    const priceA = await addToCart(page, a, 2, 2);
    const priceB = await addToCart(page, b, 3, 5);

    await page.goto('/checkout');
    await expect(page.getByTestId('product-title')).toHaveCount(2);

    const rows = page.locator('table tr');
    await expect(rows.filter({ hasText: a.name }).getByTestId('line-price')).toHaveText(fmt(2 * priceA));
    await expect(rows.filter({ hasText: b.name }).getByTestId('line-price')).toHaveText(fmt(3 * priceB));

    // Total del carrito = suma de lineas (regla de negocio)
    await expect(page.getByTestId('cart-total')).toHaveText(fmt(2 * priceA + 3 * priceB));
    // El badge del header refleja unidades totales
    await expect(page.getByTestId('nav-cart')).toHaveText('5');
  });
});

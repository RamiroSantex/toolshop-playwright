import { test, expect } from '@playwright/test';
import { addToCart, fmt, pickInStockProducts } from '../support/cart';

test.describe('Carrito - edicion', () => {
  test('RG-08 cambiar la cantidad recalcula la linea, el total y el badge', async ({ page, request }) => {
    const [product] = await pickInStockProducts(request, 1);
    const price = await addToCart(page, product, 1, 1);
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

  test('RG-09 eliminar el unico producto deja el carrito vacio', async ({ page, request }) => {
    const [product] = await pickInStockProducts(request, 1);
    await addToCart(page, product, 1, 1);
    await page.goto('/checkout');
    await expect(page.getByTestId('product-title')).toHaveText(product.name);

    await page.locator('tr', { hasText: product.name }).locator('.btn-danger').click();

    await expect(page.getByTestId('product-title')).toHaveCount(0);
    await expect(page.getByText('The cart is empty')).toBeVisible();
    await expect(page.getByTestId('nav-cart')).toBeHidden();
  });
});

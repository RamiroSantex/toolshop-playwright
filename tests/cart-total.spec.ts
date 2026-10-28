import { test, expect, Page } from '@playwright/test';

/** "$14.15" -> 14.15 (en-US) */
const money = (text: string | null) => Number((text ?? '').replace(/[^0-9.]/g, ''));

/** Abre un producto desde el home por nombre, sube la cantidad y lo agrega al carrito. */
async function addToCart(page: Page, productName: string, quantity: number, unitsInCartAfter: number) {
  await page.goto('/');
  await page.getByRole('link', { name: productName, exact: false }).first().click();
  await expect(page.getByTestId('product-name')).toHaveText(productName);
  const unitPrice = money(await page.getByTestId('unit-price').textContent());
  for (let i = 1; i < quantity; i++) await page.getByTestId('increase-quantity').click();
  await expect(page.getByTestId('quantity')).toHaveValue(String(quantity));
  await page.getByTestId('add-to-cart').click();
  // Esperar a que el badge refleje las unidades acumuladas: evita navegar antes de que termine el POST al carrito.
  await expect(page.getByTestId('nav-cart')).toHaveText(String(unitsInCartAfter));
  return unitPrice;
}

test.describe('Carrito - totales', () => {
  test('el total del carrito es la suma de cantidad x precio unitario de cada producto', async ({ page }) => {
    // El precio esperado se lee de la ficha de cada producto (oraculo independiente del carrito).
    const pliersPrice = await addToCart(page, 'Combination Pliers', 2, 2);
    const slipJointPrice = await addToCart(page, 'Slip Joint Pliers', 3, 5);

    await page.goto('/checkout');

    const rows = page.locator('table tr');
    await expect(page.getByTestId('product-title')).toHaveCount(2);

    // Total por linea
    const pliersRow = rows.filter({ hasText: 'Combination Pliers' });
    const slipRow = rows.filter({ hasText: 'Slip Joint Pliers' });
    await expect(pliersRow.getByTestId('line-price')).toHaveText(`$${(2 * pliersPrice).toFixed(2)}`);
    await expect(slipRow.getByTestId('line-price')).toHaveText(`$${(3 * slipJointPrice).toFixed(2)}`);

    // Total del carrito = suma de lineas (regla de negocio)
    const expectedTotal = 2 * pliersPrice + 3 * slipJointPrice;
    await expect(page.getByTestId('cart-total')).toHaveText(`$${expectedTotal.toFixed(2)}`);

    // El badge del header refleja unidades totales
    await expect(page.getByTestId('nav-cart')).toHaveText('5');
  });
});

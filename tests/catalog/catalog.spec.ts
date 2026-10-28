import { test, expect } from '@playwright/test';

test.describe('Catalogo', () => {
  test('RG-05 la busqueda devuelve solo productos que coinciden con el termino', async ({ page }) => {
    await page.goto('/');
    const names = page.getByTestId('product-name');
    // Esperar la carga inicial del listado: si llega despues de la busqueda, pisa los resultados filtrados.
    await expect(names.first()).toBeVisible();
    const search = page.waitForResponse((r) => r.url().includes('/products/search') && r.ok());
    await page.getByTestId('search-query').fill('hammer');
    await page.getByTestId('search-button').click();
    await search;
    // El resultado se renderiza async: esperar a que el primer producto ya sea el filtrado.
    await expect(names.first()).toContainText(/hammer/i);
    const all = await names.allInnerTexts();
    expect(all.length, 'la busqueda debe devolver al menos un producto').toBeGreaterThan(0);
    for (const name of all) expect(name, `"${name}" no coincide con "hammer"`).toMatch(/hammer/i);
  });

  test('RG-06 ordenar por precio ascendente deja los productos de menor a mayor precio', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('product-price').first()).toBeVisible();
    await page.getByTestId('sort').selectOption('price,asc');

    await expect
      .poll(
        async () => {
          const prices = (await page.getByTestId('product-price').allInnerTexts()).map((t) => Number(t.replace(/[^0-9.]/g, '')));
          return prices.length > 1 && prices.every((p, i) => i === 0 || prices[i - 1] <= p);
        },
        { message: 'los precios deben estar en orden ascendente' },
      )
      .toBe(true);
  });
});

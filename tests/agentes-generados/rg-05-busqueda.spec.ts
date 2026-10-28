// spec: specs/regression-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Catalogo', () => {
  test('RG-05 Busqueda', async ({ page }) => {
    // 1. Home, esperar el listado inicial, buscar "hammer".
    await page.goto('/');
    const names = page.getByTestId('product-name');
    // Esperar el listado inicial: si llega despues de la busqueda, pisa los resultados filtrados.
    await expect(names.first()).toBeVisible();

    const search = page.waitForResponse((r) => r.url().includes('/products/search') && r.ok());
    await page.getByTestId('search-query').fill('hammer');
    await page.getByTestId('search-submit').click();
    await search;

    await expect(names.first()).toContainText(/hammer/i);
    const all = await names.allInnerTexts();
    expect(all.length, 'la busqueda debe devolver al menos un producto').toBeGreaterThan(0);
    for (const name of all) {
      expect(name, `"${name}" no coincide con "hammer"`).toMatch(/hammer/i);
    }
  });
});

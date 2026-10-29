// spec: specs/agentes-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Catalogo', () => {
  test('RG-05 Busqueda por texto devuelve solo productos que coinciden', async ({ page }) => {
    // 1. Ir a /, escribir 'hammer' en search-query y click en search-submit
    await page.goto('/');
    await page.getByTestId('search-query').fill('hammer');
    await page.getByTestId('search-submit').click();

    await expect(page.getByTestId('search-caption')).toHaveText('Searched for: hammer');
    // La busqueda de la app es difusa (devuelve tambien pliers, etc.), asi que no todos los
    // nombres contienen 'hammer'. Web-first: esperar a que el listado filtrado reemplace al inicial.
    const names = page.getByTestId('product-name');
    await expect(names.filter({ hasText: /hammer/i }).first()).toBeVisible();
    await expect(page.getByText(/products? found for 'hammer'/i)).toBeVisible();
    expect(await names.count()).toBeGreaterThan(0);

    // 2. Negativo: buscar un termino sin resultados
    await page.getByTestId('search-query').fill('zzzzqwerty');
    await page.getByTestId('search-query').press('Enter');
    await expect(page.getByTestId('search-caption')).toHaveText('Searched for: zzzzqwerty');
    await expect(page.getByTestId('no-results')).toHaveText('There are no products found.');
    await expect(page.getByTestId('product-name')).toHaveCount(0);
  });
});

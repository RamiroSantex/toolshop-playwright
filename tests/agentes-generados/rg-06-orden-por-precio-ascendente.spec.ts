// spec: specs/regression-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Catalogo', () => {
  test('RG-06 Orden por precio ascendente', async ({ page }) => {
    // 1. Home, seleccionar orden "price,asc".
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

// spec: specs/agentes-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Catalogo', () => {
  test('RG-06 Ordenar por precio ascendente', async ({ page }) => {
    // 1. Ir a /, seleccionar en sort la opcion 'Price (Low - High)'
    await page.goto('/');
    await expect(page.getByTestId('product-name').first()).toBeVisible();
    await page.getByTestId('sort').selectOption('Price (Low - High)');

    // 2. Leer todos los product-price de la pagina y verificar orden no decreciente
    await expect(page.getByTestId('product-price').first()).toBeVisible();
    await expect
      .poll(async () => {
        const texts = await page.getByTestId('product-price').allTextContents();
        const prices = texts.map((t) => parseFloat(t.replace(/[^0-9.]/g, '')));
        return prices.length > 1 && prices.every((p, i) => i === 0 || p >= prices[i - 1]);
      })
      .toBe(true);
  });
});

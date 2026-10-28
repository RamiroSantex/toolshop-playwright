import { test, expect } from '@playwright/test';

// Seed para los agentes Planner/Generator: deja la app lista en el home con el idioma fijado por config (en-US).
test.describe('Seed', () => {
  test('seed', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('nav-home')).toBeVisible();
  });
});

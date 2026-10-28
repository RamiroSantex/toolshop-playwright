import { defineConfig, devices } from '@playwright/test';

/**
 * Toolshop (https://practicesoftwaretesting.com) - demo app publica.
 * La app es Angular y usa el atributo `data-test` (no `data-testid`),
 * por eso se configura testIdAttribute. El idioma de la UI sigue el locale
 * del navegador, asi que se fija en-US para que los textos sean deterministas.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://practicesoftwaretesting.com',
    testIdAttribute: 'data-test',
    locale: 'en-US',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

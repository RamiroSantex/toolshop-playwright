// spec: specs/regression-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

const money = (text: string | null) => Number((text ?? '').replace(/[^0-9.]/g, ''));
const fmt = (n: number) => `$${n.toFixed(2)}`;

test.describe('Checkout', () => {
  test('RG-10 Pedido completo', async ({ page }) => {
    // 1. Agregar 2x Combination Pliers, /checkout, total correcto, "Proceed to checkout".
    await page.goto('/');
    await expect(page.getByTestId('product-name').first()).toBeVisible();
    const search = page.waitForResponse((r) => r.url().includes('/products/search') && r.ok());
    await page.getByTestId('search-query').fill('Combination Pliers');
    await page.getByTestId('search-submit').click();
    await search;
    await page.getByTestId('product-name').filter({ hasText: 'Combination Pliers' }).first().click();
    await expect(page.getByTestId('product-name')).toHaveText('Combination Pliers');
    const price = money(await page.getByTestId('unit-price').textContent());
    await page.getByTestId('increase-quantity').click();
    await expect(page.getByTestId('quantity')).toHaveValue('2');
    await page.getByTestId('add-to-cart').click();
    await expect(page.getByTestId('nav-cart')).toHaveText('2');

    await page.goto('/checkout');
    await expect(page.getByTestId('cart-total')).toHaveText(fmt(2 * price));
    await page.getByTestId('proceed-1').click();

    // 2. Login en el paso 2 y continuar.
    await page.getByTestId('email').fill('customer@practicesoftwaretesting.com');
    await page.getByTestId('password').fill('welcome01');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('proceed-2')).toBeVisible();
    await page.getByTestId('proceed-2').click();

    // 3. Direccion: esperar prefill del perfil, elegir ES / 28001 / 10, esperar postcode-lookup, continuar.
    await expect(page.getByTestId('street')).not.toHaveValue('');
    const lookup = page.waitForResponse((r) => r.url().includes('/postcode-lookup') && r.url().includes('house_number=10') && r.ok());
    await page.getByTestId('country').selectOption('ES');
    await page.getByTestId('postal_code').fill('28001');
    await page.getByTestId('house_number').fill('10');
    await lookup;
    await expect(page.getByTestId('state')).not.toHaveValue('');
    await expect(page.getByTestId('proceed-3')).toBeEnabled();
    await page.getByTestId('proceed-3').click();

    // 4. Pago: "Cash on Delivery", verificar pago, confirmar.
    await page.getByTestId('payment-method').selectOption('cash-on-delivery');
    await page.getByTestId('finish').click();
    await expect(page.getByTestId('payment-success-message')).toHaveText('Payment was successful');
    await expect(page.getByTestId('finish')).toHaveText('Confirm');
    const invoice = page.waitForResponse((r) => r.url().endsWith('/invoices') && r.request().method() === 'POST');
    await page.getByTestId('finish').click();
    const res = await invoice;
    expect(res.status(), `POST /invoices: ${await res.text()}`).toBe(201);

    await expect(page.getByText(/Thanks for your order! Your invoice number is INV-\d+/)).toBeVisible();
  });
});

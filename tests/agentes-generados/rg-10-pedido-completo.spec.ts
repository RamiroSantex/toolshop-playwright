// spec: specs/agentes-plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

const API = process.env.API_URL ?? 'https://api.practicesoftwaretesting.com';

test.describe('Checkout', () => {
  test('RG-10 Checkout completo confirma pedido con numero de factura', async ({ page, request }) => {
    // Precondicion: login valido con la cuenta customer
    await page.goto('/auth/login');
    await page.getByTestId('email').fill('customer@practicesoftwaretesting.com');
    await page.getByTestId('password').fill('welcome01');
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/\/account$/);

    // 1. Agregar un producto con stock, ir a nav-cart, click en proceed-1
    const res = await request.get(`${API}/products`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const product = body.data.find(
      (p: { in_stock: boolean; is_rental: boolean }) => p.in_stock && !p.is_rental,
    );

    await page.goto(`/product/${product.id}`);
    await expect(page.getByTestId('add-to-cart')).toBeVisible();
    await page.getByTestId('add-to-cart').click();
    await expect(page.getByTestId('cart-quantity')).toHaveText('1');
    await page.getByTestId('nav-cart').click();
    await page.getByTestId('proceed-1').click();
    await expect(page).toHaveURL(/\/checkout$/);

    // 2. Con sesion iniciada, click en proceed-2
    await expect(page.getByTestId('proceed-2')).toBeVisible();
    await page.getByTestId('proceed-2').click();
    await expect(page.getByTestId('country')).toBeVisible();

    // 3. Completar direccion de facturacion y click en proceed-3
    // El autocompletado (GET /postcode-lookup) rellena street, city Y state, y su respuesta
    // reescribe el formulario. No se escriben esos campos a mano (un state propio no coincide
    // con el pais -> 422 en POST /invoices): se espera a la respuesta y a que los campos se llenen.
    await page.getByTestId('country').selectOption('AT');
    // Una respuesta tardia del lookup puede vaciar postal_code/house_number: se reintenta el
    // llenado hasta que el formulario queda estable con todos los campos completos.
    await expect(async () => {
      await page.getByTestId('postal_code').fill('1010');
      const lookup = page.waitForResponse((r) => r.url().includes('/postcode-lookup') && r.ok());
      await page.getByTestId('house_number').fill('98');
      await lookup;
      await expect(page.getByTestId('street')).not.toHaveValue('', { timeout: 2000 });
      await expect(page.getByTestId('city')).not.toHaveValue('', { timeout: 2000 });
      await expect(page.getByTestId('state')).not.toHaveValue('', { timeout: 2000 });
      await expect(page.getByTestId('postal_code')).toHaveValue('1010', { timeout: 2000 });
      await expect(page.getByTestId('house_number')).toHaveValue('98', { timeout: 2000 });
    }).toPass({ timeout: 20000 });
    await expect(page.getByTestId('proceed-3')).toBeEnabled();
    await page.getByTestId('proceed-3').click();
    await expect(page.getByTestId('payment-method')).toBeVisible();

    // 4. Elegir cash-on-delivery y click en finish (Check payment)
    await page.getByTestId('payment-method').selectOption('cash-on-delivery');
    await page.getByTestId('finish').click();
    await expect(page.getByTestId('payment-success-message')).toHaveText('Payment was successful');
    await expect(page.getByTestId('finish')).toHaveText('Confirm');

    // 5. Click en finish (Confirm)
    const invoiceResponse = page.waitForResponse(
      (r) => r.url().includes('/invoices') && r.request().method() === 'POST',
    );
    await page.getByTestId('finish').click();
    const inv = await invoiceResponse;
    expect(inv.ok(), `POST /invoices -> ${inv.status()} ${await inv.text().catch(() => '')}`).toBeTruthy();
    await expect(page.locator('#order-confirmation')).toContainText('Thanks for your order!');
    await expect(page.locator('#order-confirmation span')).toHaveText(/INV-/);
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByTestId('cart-quantity')).toHaveCount(0);
  });
});

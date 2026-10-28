import { test, expect } from '@playwright/test';
import { addToCart, fmt, pickInStockProducts } from '../support/cart';

test.describe('Checkout', () => {
  test('RG-10 checkout completo (login, direccion, contra reembolso) confirma el pedido con numero de factura', async ({ page, request }) => {
    const [product] = await pickInStockProducts(request, 1);
    const price = await addToCart(page, product, 2, 2);
    await page.goto('/checkout');
    await expect(page.getByTestId('cart-total')).toHaveText(fmt(2 * price));
    await page.getByTestId('proceed-1').click();

    // Paso 2: login dentro del checkout
    await page.getByTestId('email').fill('customer@practicesoftwaretesting.com');
    await page.getByTestId('password').fill('welcome01');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('proceed-2')).toBeVisible();
    await page.getByTestId('proceed-2').click();

    // Paso 3: direccion. El lookup por pais/codigo postal/numero autocompleta street/city/state y el backend
    // valida que la ciudad pertenezca al pais, asi que se espera al lookup y se usan sus valores.
    // Primero esperar el prefill del perfil (GET /users/me): si llega despues de tipear, pisa el formulario.
    await expect(page.getByTestId('street')).not.toHaveValue('');
    const lookup = page.waitForResponse((r) => r.url().includes('/postcode-lookup') && r.url().includes('house_number=10') && r.ok());
    await page.getByTestId('country').selectOption('ES');
    await page.getByTestId('postal_code').fill('28001');
    await page.getByTestId('house_number').fill('10');
    await lookup;
    await expect(page.getByTestId('state')).not.toHaveValue('');
    await expect(page.getByTestId('proceed-3')).toBeEnabled();
    await page.getByTestId('proceed-3').click();

    // Paso 4: pago
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

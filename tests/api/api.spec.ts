import { test, expect } from '@playwright/test';
import { API_URL, pickInStockProducts } from '../support/cart';
import { CUSTOMER } from '../support/users';

/**
 * Casos por API (fixture `request`, sin UI) contra https://api.practicesoftwaretesting.com
 * Validan reglas de negocio y contrato, no solo el status code.
 */


test.describe('API', () => {
  test('API-01 login valido devuelve token bearer y el token identifica al usuario', async ({ request }) => {
    const res = await request.post(`${API_URL}/users/login`, { data: { email: CUSTOMER.email, password: CUSTOMER.password } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token_type).toBe('bearer');
    expect(body.expires_in).toBeGreaterThan(0);
    expect(body.access_token.split('.'), 'el token debe ser un JWT (3 segmentos)').toHaveLength(3);

    // El token abre el recurso protegido y pertenece al usuario que se logueo
    const me = await request.get(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${body.access_token}` } });
    expect(me.status()).toBe(200);
    expect((await me.json()).email).toBe(CUSTOMER.email);
  });

  // Email inexistente a proposito: fallar la password de una cuenta real la bloquea (423) y rompe el resto de la suite.
  test('API-02 credenciales invalidas devuelven 401 y el recurso protegido rechaza peticiones sin token', async ({ request }) => {
    const bad = await request.post(`${API_URL}/users/login`, { data: { email: 'no-existe@example.com', password: 'x' } });
    expect(bad.status()).toBe(401);
    expect(await bad.json()).toEqual({ error: 'Unauthorized' });

    const anonymous = await request.get(`${API_URL}/users/me`);
    expect(anonymous.status()).toBe(401);
  });

  test('API-03 carrito: agregar un producto guarda la cantidad y el producto correctos', async ({ request }) => {
    const [product] = await pickInStockProducts(request, 1);
    const cart = await (await request.post(`${API_URL}/carts`)).json();
    expect(cart.id).toBeTruthy();

    const add = await request.post(`${API_URL}/carts/${cart.id}`, { data: { product_id: product.id, quantity: 3 } });
    expect(add.status()).toBe(200);

    const saved = await (await request.get(`${API_URL}/carts/${cart.id}`)).json();
    expect(saved.cart_items).toHaveLength(1);
    expect(saved.cart_items[0].quantity).toBe(3);
    expect(saved.cart_items[0].product_id).toBe(product.id);

    // El precio del item coincide con el precio publicado del producto (fuente independiente)
    const catalog = await (await request.get(`${API_URL}/products/${product.id}`)).json();
    expect(saved.cart_items[0].product.price).toBe(catalog.price);
  });

  test('API-04 listado de productos ordenado por precio ascendente respeta el orden y la paginacion', async ({ request }) => {
    const res = await request.get(`${API_URL}/products?sort=price,asc&page=1`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    const prices: number[] = body.data.map((p: { price: number }) => p.price);

    expect(prices.length).toBeGreaterThan(1);
    expect(prices, 'los precios deben venir de menor a mayor').toEqual([...prices].sort((a, b) => a - b));
    expect(body.current_page).toBe(1);
    expect(body.total).toBeGreaterThanOrEqual(body.data.length);
  });
});

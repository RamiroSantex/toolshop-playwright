import { APIRequestContext, expect, Page } from '@playwright/test';

export const API_URL = process.env.API_URL ?? 'https://api.practicesoftwaretesting.com';

export type Product = { id: string; name: string };

/** "$14.15" -> 14.15 (UI en-US) */
export const money = (text: string | null) => Number((text ?? '').replace(/[^0-9.]/g, ''));
/** 28.3 -> "$28.30" */
export const fmt = (n: number) => `$${n.toFixed(2)}`;

/**
 * Devuelve `count` productos CON stock cuyos nombres no se contienen entre si
 * (evita que "Pliers" matchee "Combination Pliers" al filtrar filas del carrito).
 * El stock de la demo cambia (ej. Combination Pliers aparece sin stock) y con un producto fijo la suite se vuelve intermitente.
 */
export async function pickInStockProducts(request: APIRequestContext, count: number): Promise<Product[]> {
  const res = await request.get(`${API_URL}/products?page=1`);
  expect(res.ok(), 'GET /products debe responder 200').toBeTruthy();
  const { data } = (await res.json()) as { data: (Product & { in_stock: boolean })[] };
  const picked: Product[] = [];
  for (const p of data.filter((d) => d.in_stock)) {
    const clash = picked.some((q) => q.name.includes(p.name) || p.name.includes(q.name));
    if (!clash) picked.push({ id: p.id, name: p.name });
    if (picked.length === count) return picked;
  }
  throw new Error(`No hay ${count} productos con stock en la primera pagina`);
}

/**
 * Abre la ficha del producto, sube la cantidad y lo agrega al carrito.
 * Devuelve el precio unitario leido de la ficha (oraculo independiente del carrito).
 * `unitsInCartAfter` = unidades acumuladas esperadas en el badge: evita navegar antes de que termine el POST al carrito.
 */
export async function addToCart(page: Page, product: Product, quantity: number, unitsInCartAfter: number) {
  await page.goto(`/product/${product.id}`);
  await expect(page.getByTestId('product-name')).toHaveText(product.name);
  const unitPrice = money(await page.getByTestId('unit-price').textContent());
  for (let i = 1; i < quantity; i++) await page.getByTestId('increase-quantity').click();
  await expect(page.getByTestId('quantity')).toHaveValue(String(quantity));
  await page.getByTestId('add-to-cart').click();
  await expect(page.getByTestId('nav-cart')).toHaveText(String(unitsInCartAfter));
  return unitPrice;
}

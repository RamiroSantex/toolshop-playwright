/**
 * Cuenta de cliente publica de la demo. Se puede sobreescribir por entorno
 * (CUSTOMER_EMAIL / CUSTOMER_PASSWORD / CUSTOMER_NAME) si la cuenta compartida esta bloqueada (HTTP 423).
 */
export const CUSTOMER = {
  email: process.env.CUSTOMER_EMAIL ?? 'customer@practicesoftwaretesting.com',
  password: process.env.CUSTOMER_PASSWORD ?? 'welcome01',
  name: process.env.CUSTOMER_NAME ?? 'Jane Doe',
};

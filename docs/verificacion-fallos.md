# Verificacion: cada test pasa y FALLA cuando el comportamiento se rompe

## Como se comprobo

La app Toolshop es externa (no tenemos su codigo), asi que "romper el codigo" se hizo simulando el defecto de la app
con **una mutacion minima y temporal por test** (cambiar el valor esperado, la entrada o la accion que dispara el comportamiento).
Automatizado en `scripts/verify-failures.py`:

1. Para cada caso: ejecutar el test sin tocar (debe pasar).
2. Aplicar la mutacion al spec, ejecutar solo ese test con `--retries=0` (debe fallar, y por la razon esperada).
3. Restaurar el archivo original byte a byte (bloque `finally`). `git status` queda limpio despues de correrlo.

Comando: `python scripts/verify-failures.py`  (equivale a `npx playwright test --grep RG-XX --retries=0` por caso, con y sin mutacion).

## Resultado (corrida del 2026-10-28, chromium, https://practicesoftwaretesting.com)

| Caso | Defecto simulado | Sin romper | Roto | Error observado | Veredicto |
|------|------------------|-----------|------|-----------------|-----------|
| RG-01 | el login muestra otro usuario | pass | fail | `toHaveText` de `nav-menu` ("Jane Doe" vs "John Doe") | OK |
| RG-02 | cambia/pierde el mensaje de error ante credenciales invalidas | pass | fail | `toHaveText` de `login-error` | OK |
| RG-03 | cambia el mensaje de validacion de email | pass | fail | `toHaveText` de `email-error` | OK |
| RG-04 | la ruta protegida no muestra el formulario de login | pass | fail | `toBeHidden` de `login-form` | OK |
| RG-05 | la busqueda devuelve productos que no coinciden | pass | fail | `"Claw Hammer with Shock Reduction Grip" no coincide con "pliers"` | OK |
| RG-06 | orden ascendente devuelve el orden inverso | pass | fail | `los precios deben estar en orden ascendente` | OK |
| RG-07 | el total del carrito suma una unidad menos | pass | fail | `toHaveText` de `cart-total` | OK |
| RG-08 | el total no se recalcula bien al cambiar cantidad | pass | fail | `toHaveText` de `cart-total` | OK |
| RG-09 | el boton eliminar no elimina la linea | pass | fail | `toHaveCount(0)` de `product-title` | OK |
| RG-10 | el pago no se verifica y el pedido no puede completarse | pass | fail | `toHaveText` de `payment-success-message` | OK |

10/10 pasan sin romper y 10/10 fallan al romper. Codigo restaurado (verificado con `git status` limpio).

Limitaciones honestas:
- Es mutacion del lado del test, no del lado de la app: demuestra que las aserciones son sensibles al comportamiento, no que la app
  real pueda fallar de esa forma. Para un defecto "real" haria falta interceptar la red (`page.route`) o tener la app en local (Docker del repo de referencia).
- En una primera corrida RG-04 "no fallo" con una mutacion mal elegida (`toHaveURL(/account$/)` pasa porque la URL es `/account` unos ms antes de la redireccion).
  Se reemplazo la mutacion por una sobre `login-form`. Aprendizaje: `toHaveURL` puede dar falsos positivos con redirecciones del lado cliente.

## Registro de "healing" (fallos reales encontrados mientras se escribian los tests)

Estos fallos aparecieron contra la app real y se repararon a mano (el equivalente al Healer); no fueron defectos del producto salvo la nota 5.

| # | Test | Sintoma | Causa raiz | Fix |
|---|------|---------|-----------|-----|
| 1 | RG-07 | solo 1 linea en el carrito | se navegaba (`goto`) antes de que terminara el POST al carrito | esperar que el badge `nav-cart` muestre las unidades acumuladas |
| 2 | RG-05 | primer producto "Combination Pliers" tras buscar "hammer" (intermitente) | el listado inicial llegaba despues de la busqueda y pisaba los resultados | esperar el listado inicial y `waitForResponse` de `/products/search` |
| 3 | RG-06 | `waitForResponse` colgado | la API nueva usa metodo HTTP `QUERY` con body, el orden ya no va en la URL | quitar la espera por URL; `expect.poll` sobre los precios |
| 4 | RG-10 | el pago no se verifica y el pedido no puede completarse | pass | fail | `toHaveText` de `payment-success-message` | OK |
| 5 | RG-07..RG-10 | `add-to-cart` deshabilitado, suite roja | "Combination Pliers" paso a `in_stock: false` en la demo (dato mutable) | elegir productos con stock via `GET /products` en cada test (`pickInStockProducts`) |

| 6 | RG-01 / RG-10 / API-01 | login 423 (Locked) con la cuenta publica | la app **bloquea la cuenta** tras varios logins fallidos; mis corridas de verificacion usaban password incorrecto sobre `customer@...` | RG-02 y la verificacion usan un email inexistente / mutan el mensaje esperado, nunca fallan el login de una cuenta real. `CUSTOMER_EMAIL`/`CUSTOMER_PASSWORD`/`CUSTOMER_NAME` permiten usar `customer2@...` ("Jack Howe") si la cuenta esta bloqueada |
| 7 | varios | 404 en fichas de producto a mitad de una corrida | la demo se **resembro** (ids de producto nuevos, stock y bloqueos reiniciados) mientras corria la suite | los ids se obtienen de la API en cada test (nunca hardcodeados); en CI hay `retries: 2` |

Nota 5 es relevante para la regresion real: los tests no deben depender de un producto fijo en una demo compartida.

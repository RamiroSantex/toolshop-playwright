# 10 casos de regresion candidatos - Toolshop

App: https://practicesoftwaretesting.com (demo Toolshop, Angular). API: https://api.practicesoftwaretesting.com
Usuario de prueba publico: `customer@practicesoftwaretesting.com` / `welcome01`.

## Criterio de priorizacion

- **Riesgo** = impacto en el negocio x probabilidad de regresion (cambios frecuentes en el area). Escala A (critico) / M (medio) / B (bajo).
- **Tiempo** = duracion estimada de ejecucion automatizada: R (rapido, < 10 s), M (medio, 10-30 s), L (lento, > 30 s).
- **Prioridad** = P1 corre en cada PR (smoke de regresion), P2 corre en cada PR si el tiempo total lo permite / nightly, P3 nightly.
  Regla: riesgo A siempre es P1 sin importar el tiempo; riesgo M y rapido sube a P1/P2; riesgo B o lento va a P3.

| # | ID | Caso | Area | Riesgo | Tiempo | Prioridad | Por que entra a regresion |
|---|----|------|------|--------|--------|-----------|---------------------------|
| 1 | RG-01 | Login valido redirige a `/account` y muestra el nombre del usuario | Auth | A | R | P1 | Sin login no se puede comprar ni ver facturas; todo depende de esto |
| 2 | RG-02 | Login con password incorrecto muestra "Invalid email or password" y no inicia sesion | Auth | A | R | P1 | Regresion de seguridad: no debe autenticar credenciales invalidas |
| 3 | RG-03 | Login con campos vacios muestra validaciones de email y password requeridos | Auth | M | R | P2 | Validacion de formulario, cambia con frecuencia en el front |
| 4 | RG-04 | Acceder a `/account` sin sesion redirige a `/auth/login` | Auth / seguridad | A | R | P1 | Control de acceso a datos de cuenta |
| 5 | RG-05 | Busqueda por texto devuelve solo productos que coinciden con el termino | Catalogo | M | R | P2 | Flujo de entrada principal a la compra |
| 6 | RG-06 | Ordenar por precio ascendente deja los productos ordenados de menor a mayor | Catalogo | M | R | P2 | Logica de ordenamiento (back + front) propensa a regresiones |
| 7 | RG-07 | Total del carrito = suma de cantidad x precio unitario (varios productos) | Carrito | A | M | P1 | Error de calculo = error de dinero |
| 8 | RG-08 | Cambiar la cantidad de una linea recalcula la linea, el total y el badge | Carrito | A | M | P1 | Misma regla de calculo, otro punto de entrada |
| 9 | RG-09 | Eliminar el unico producto del carrito lo deja vacio | Carrito | M | M | P2 | Estado vacio / limpieza de carrito |
| 10 | RG-10 | Checkout completo (login, direccion, contra reembolso) confirma pedido con numero de factura | Checkout | A | L | P1 | Flujo que genera ingresos; integra auth + carrito + direccion + pago |

## Orden de ejecucion sugerido (por tiempo/riesgo)

1. P1 rapidos: RG-01, RG-02, RG-04
2. P1 medios/lentos: RG-07, RG-08, RG-10
3. P2: RG-03, RG-05, RG-06, RG-09

## Fuera de alcance de los 10 (cubiertos aparte)

- Hito 6: 2+ casos por API (`POST /users/login`, `GET /products`) y Page Object de login.
- Backlog: favoritos, comparar productos, registro de usuario, facturas (PDF), filtros por categoria/eco, otros metodos de pago, i18n.

## Notas de automatizacion

- La UI cambia de idioma segun el locale del navegador; la config fija `locale: 'en-US'`.
- El atributo de test es `data-test` (no `data-testid`): `testIdAttribute: 'data-test'` en `playwright.config.ts`.
- Los ids de producto son ULIDs que pueden cambiar si la demo se resiembra: los tests navegan por nombre visible, no por id.
- El carrito se persiste con una llamada asincrona: antes de navegar hay que esperar que el badge `nav-cart` refleje las unidades.

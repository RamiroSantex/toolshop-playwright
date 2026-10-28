# Plan de pruebas de regresion - Toolshop

- **Seed**: `tests/seed.spec.ts` (abre el home en en-US)
- **App**: https://practicesoftwaretesting.com  |  **API**: https://api.practicesoftwaretesting.com
- **Usuario**: `customer@practicesoftwaretesting.com` / `welcome01` (publico en la demo)
- Origen de los casos y priorizacion: `docs/10-casos-regresion.md`

> Nota de proceso: este plan se escribio con el formato del agente Planner de `init-agents`
> (suite > escenario > pasos > resultado esperado), exploracion hecha con el MCP de Playwright sobre la app real.
> Ver README / `docs/verificacion-fallos.md` para el detalle de que agentes se ejecutaron realmente.

## 1. Login (`tests/auth/login.spec.ts`)

### 1.1 RG-01 Login valido (P1)
1. Ir a `/auth/login`.
2. Completar email y password validos y enviar.
- Esperado: URL `/account`, titulo "My account", menu de usuario "Jane Doe", link "Sign in" oculto.

### 1.2 RG-02 Password incorrecto (P1)
1. Ir a `/auth/login`, email valido + password incorrecto, enviar.
- Esperado: mensaje "Invalid email or password"; sigue en `/auth/login`; no hay menu de usuario.

### 1.3 RG-03 Campos vacios (P2)
1. Ir a `/auth/login` y enviar sin completar.
- Esperado: "Email is required" y "Password is required"; sigue en login.

### 1.4 RG-04 Ruta protegida sin sesion (P1)
1. Ir directo a `/account` sin sesion.
- Esperado: redireccion a `/auth/login` con el formulario visible.

## 2. Catalogo (`tests/catalog/catalog.spec.ts`)

### 2.1 RG-05 Busqueda (P2)
1. Home, esperar el listado inicial, buscar "hammer".
- Esperado: al menos 1 producto y todos los nombres contienen "hammer".

### 2.2 RG-06 Orden por precio ascendente (P2)
1. Home, seleccionar orden "price,asc".
- Esperado: los precios del listado estan en orden no decreciente.

## 3. Carrito (`tests/cart-total.spec.ts`, `tests/cart/cart.spec.ts`)

### 3.1 RG-07 Total del carrito (P1)
1. Agregar 2x Combination Pliers y 3x Slip Joint Pliers (precio unitario leido de cada ficha).
2. Abrir `/checkout`.
- Esperado: total por linea = cantidad x precio; total = suma de lineas; badge = 5.

### 3.2 RG-08 Cambio de cantidad (P1)
1. Agregar 1x Combination Pliers, ir a `/checkout`, cambiar cantidad a 4.
- Esperado: linea y total = 4 x precio; badge = 4.

### 3.3 RG-09 Eliminar producto (P2)
1. Agregar 1x Combination Pliers, ir a `/checkout`, eliminar la linea.
- Esperado: sin lineas, mensaje "The cart is empty", sin badge.

## 4. Checkout (`tests/checkout/checkout.spec.ts`)

### 4.1 RG-10 Pedido completo (P1)
1. Agregar 2x Combination Pliers, `/checkout`, total correcto, "Proceed to checkout".
2. Login en el paso 2 y continuar.
3. Direccion: esperar prefill del perfil, elegir ES / 28001 / 10, esperar `postcode-lookup`, continuar.
4. Pago: "Cash on Delivery", verificar pago ("Payment was successful"), confirmar.
- Esperado: `POST /invoices` = 201 y mensaje "Thanks for your order! Your invoice number is INV-...".
- Efecto lateral: crea una factura real en la demo (aceptado, es datos de prueba).

## Riesgos / observaciones detectadas al explorar

- El prefill del perfil (`GET /users/me`) llega de forma asincrona y pisa el formulario de direccion si se tipea antes.
- El `postcode-lookup` completa street/city/state con valores aleatorios; el backend valida que la ciudad pertenezca al pais,
  por eso no se pueden pisar a mano.
- El listado inicial puede llegar despues de una busqueda lanzada muy rapido y pisar los resultados.
- El carrito se persiste con un POST asincrono: navegar antes de que termine pierde el producto.

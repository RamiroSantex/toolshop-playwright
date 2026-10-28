# Plan de regresion Toolshop (RG-01 a RG-10)

## Application Overview

Plan de prueba para los 10 casos de regresion de docs/10-casos-regresion.md sobre https://practicesoftwaretesting.com (Toolshop, Angular). Atributo de test: data-test (getByTestId). Locale en-US. Usuario valido: customer@practicesoftwaretesting.com / welcome01. NUNCA hacer logins fallidos con esa cuenta (se bloquea): para credenciales invalidas usar noexiste.qa@example.com. No hardcodear ids/productos: elegir productos con stock desde GET /products. Selectores observados en exploracion: email, password, login-submit, login-error, email-error, password-error, nav-menu, page-title, search-query, search-submit, search-reset, search-caption, sort, product-name, product-price, add-to-cart, quantity, increase-quantity, nav-cart, cart-quantity, product-quantity, cart-total, proceed-1/2/3, street, city, state, country (select), postal_code, payment-method, finish. Selectores adicionales confirmados en la segunda pasada sobre el sitio real: house_number, payment-success-message, #order-confirmation (sin data-test), boton eliminar `table a.btn-danger` (sin data-test). Pendientes: ver 'Pendiente de confirmar' en RG-10. La URL del carrito es /checkout.

## Test Scenarios

### 1. Auth

**Seed:** `tests/seed.spec.ts`

#### 1.1. RG-01 Login valido redirige a /account y muestra el nombre del usuario

**File:** `tests/auth/rg-01-login-valido.spec.ts`

**Steps:**
  1. Ir a /auth/login
    - expect: Se muestra el formulario con email, password y login-submit
  2. Completar email customer@practicesoftwaretesting.com y password welcome01, click en login-submit
    - expect: La URL pasa a /account
    - expect: page-title muestra 'My account'
    - expect: nav-menu muestra el nombre del usuario (observado: 'Jane Doe')

#### 1.2. RG-02 Login con credenciales invalidas muestra error y no inicia sesion

**File:** `tests/auth/rg-02-login-invalido.spec.ts`

**Steps:**
  1. Ir a /auth/login. Completar email noexiste.qa@example.com (NO usar la cuenta customer) y password wrongpass123, click en login-submit
    - expect: login-error muestra 'Invalid email or password'
    - expect: La URL sigue en /auth/login
    - expect: No aparece nav-menu con nombre de usuario; sigue visible nav-sign-in

#### 1.3. RG-03 Login con campos vacios muestra validaciones requeridas

**File:** `tests/auth/rg-03-login-vacio.spec.ts`

**Steps:**
  1. Ir a /auth/login y click en login-submit sin completar campos
    - expect: email-error muestra 'Email is required'
    - expect: password-error muestra 'Password is required'
    - expect: La URL sigue en /auth/login

#### 1.4. RG-04 Acceder a /account sin sesion redirige a /auth/login

**File:** `tests/auth/rg-04-account-sin-sesion.spec.ts`

**Steps:**
  1. Con contexto limpio (sin cookies ni localStorage) navegar directo a /account
    - expect: La URL final es /auth/login
    - expect: Se muestra el formulario de login y no datos de cuenta

### 2. Catalogo

**Seed:** `tests/seed.spec.ts`

#### 2.1. RG-05 Busqueda por texto devuelve solo productos que coinciden

**File:** `tests/catalog/rg-05-busqueda.spec.ts`

**Steps:**
  1. Ir a /, escribir 'hammer' en search-query y click en search-submit
    - expect: search-caption muestra 'Searched for: hammer'
    - expect: Todos los product-name contienen 'hammer' (observado: 6 resultados, p.ej. Claw Hammer, Thor Hammer)
    - expect: Lista no vacia
  2. Negativo opcional: buscar un termino sin resultados (p.ej. 'zzzzqwerty')
    - expect: No se listan productos y se muestra mensaje de sin resultados

#### 2.2. RG-06 Ordenar por precio ascendente

**File:** `tests/catalog/rg-06-orden-precio.spec.ts`

**Steps:**
  1. Ir a /, seleccionar en sort la opcion 'Price (Low - High)'
    - expect: La lista se recarga
  2. Leer todos los product-price de la pagina
    - expect: Los precios estan en orden no decreciente (observado: $3.55, $3.95, $4.65 ... $9.17)

### 3. Carrito

**Seed:** `tests/seed.spec.ts`

#### 3.1. RG-07 Total del carrito = suma de cantidad x precio unitario

**File:** `tests/cart/rg-07-total-carrito.spec.ts`

**Steps:**
  1. Obtener de GET /products dos productos con stock. Agregar el primero (cantidad 2 con increase-quantity) y el segundo (cantidad 1) con add-to-cart; esperar que el badge cart-quantity refleje las unidades antes de navegar
    - expect: cart-quantity muestra 3
  2. Ir a nav-cart
    - expect: Hay dos lineas con product-price y product-quantity
    - expect: cart-total = suma de cantidad x precio unitario de cada linea (con 1 producto de $3.55 el total observado fue $3.55)

#### 3.2. RG-08 Cambiar la cantidad recalcula linea, total y badge

**File:** `tests/cart/rg-08-cambiar-cantidad.spec.ts`

**Steps:**
  1. Agregar un producto con stock y abrir el carrito
    - expect: Linea con cantidad 1 y total = precio unitario
  2. Cambiar product-quantity a 3 y salir del campo
    - expect: El total de la linea = 3 x precio unitario
    - expect: cart-total se actualiza igual
    - expect: El badge cart-quantity muestra 3

#### 3.3. RG-09 Eliminar el unico producto deja el carrito vacio

**File:** `tests/cart/rg-09-eliminar-producto.spec.ts`

**Steps:**
  1. Agregar un producto con stock, ir al carrito (nav-cart; la URL del carrito es /checkout) y click en el boton de eliminar de la linea. CONFIRMADO en el sitio real: es un <a class="btn btn-danger"> dentro de la tabla (icono xmark, sin texto, sin data-test, sin nombre accesible). Selector: page.locator('table a.btn-danger') (1 por linea; con una sola linea no hay ambiguedad)
    - expect: Aparece el alert/toast 'Product deleted.' (role alert)
    - expect: La tabla de lineas desaparece
    - expect: Se muestra el texto 'The cart is empty. Nothing to display.' (elemento <p> sin data-test; usar getByText)
    - expect: El badge cart-quantity deja de existir en el DOM (count 0), no muestra 0
    - expect: No existe proceed-1

### 4. Checkout

**Seed:** `tests/seed.spec.ts`

#### 4.1. RG-10 Checkout completo confirma pedido con numero de factura

**File:** `tests/checkout/rg-10-checkout-completo.spec.ts`

**Steps:**
  1. Agregar un producto con stock, ir a nav-cart, click en proceed-1
    - expect: La URL es /checkout (el carrito y el checkout comparten URL; es un stepper Cart, Sign in, Billing Address, Payment)
  2. Con sesion ya iniciada (login valido previo con customer@practicesoftwaretesting.com / welcome01) click en proceed-2. NO VERIFICADO: el paso 'Sign in' sin sesion previa (no se hizo un segundo login)
    - expect: Aparece 'Billing Address' con country (SELECT), postal_code, house_number, street, city, state; street y city llegan pre-cargados del perfil; proceed-3 esta habilitado (confirmado)
  3. selectOption en country (label 'Austria' probado; value 'AR' NO probado), completar postal_code '1010', house_number '98', street, city, state; click en proceed-3. Nota: tras completar pais, CP y numero la app autocompleta (lookup) street, city y state y pisa lo tipeado (observado: Marvin-Krenn-Gasse / Mittersill / Vorarlberg), por lo que no se debe asertar sobre los valores tipeados
    - expect: Se muestra el paso de pago con payment-method (SELECT) con opciones value: '' (Choose your payment method), bank-transfer, cash-on-delivery, credit-card, buy-now-pay-later, gift-card
  4. selectOption('cash-on-delivery') en payment-method y click en finish (en este momento el boton dice 'Check payment')
    - expect: Aparece getByTestId('payment-success-message') (class help-block) con texto exacto 'Payment was successful' (tambien dentro de un .alert.alert-success)
    - expect: El boton finish (mismo data-test) ahora dice 'Confirm'
  5. Click en finish ('Confirm')
    - expect: Se muestra #order-confirmation (div, sin data-test; usar locator('#order-confirmation')) con el texto 'Thanks for your order! Your invoice number is INV-2026000008.'. El numero esta en un <span> dentro: locator('#order-confirmation span'). Formato observado: /^INV-\d{10}$/ (un solo ejemplo; el numero es incremental y cambia en cada pedido, no hardcodear)
    - expect: La URL sigue en /checkout y el badge cart-quantity deja de existir (carrito vaciado)

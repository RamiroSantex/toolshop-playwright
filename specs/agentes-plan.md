# Plan de regresion Toolshop (RG-01 a RG-10)

## Application Overview

Plan de prueba para los 10 casos de regresion de docs/10-casos-regresion.md sobre https://practicesoftwaretesting.com (Toolshop, Angular). Atributo de test: data-test (getByTestId). Locale en-US. Usuario valido: customer@practicesoftwaretesting.com / welcome01. NUNCA hacer logins fallidos con esa cuenta (se bloquea): para credenciales invalidas usar noexiste.qa@example.com. No hardcodear ids/productos: elegir productos con stock desde GET /products. Selectores observados en exploracion: email, password, login-submit, login-error, email-error, password-error, nav-menu, page-title, search-query, search-submit, search-reset, search-caption, sort, product-name, product-price, add-to-cart, quantity, increase-quantity, nav-cart, cart-quantity, product-quantity, cart-total, proceed-1/2/3, street, city, state, country (select), postal_code, payment-method, finish. Nota: los pasos finales del checkout (mensaje y confirmacion con numero de factura) NO se pudieron verificar en la exploracion (la sesion se colgo); sus selectores son por confirmar.

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
  1. Agregar un producto con stock, ir al carrito y click en el boton de eliminar de la linea (selector por confirmar, no verificado en la exploracion)
    - expect: La linea desaparece
    - expect: Se muestra el mensaje de carrito vacio
    - expect: El badge se oculta o muestra 0
    - expect: No hay boton proceed-1 activo

### 4. Checkout

**Seed:** `tests/seed.spec.ts`

#### 4.1. RG-10 Checkout completo confirma pedido con numero de factura

**File:** `tests/checkout/rg-10-checkout-completo.spec.ts`

**Steps:**
  1. Agregar un producto con stock, ir a nav-cart, click en proceed-1
    - expect: La URL es /checkout y se pide autenticacion si no hay sesion
  2. Iniciar sesion con customer@practicesoftwaretesting.com / welcome01 (login valido, no fallido) y click en proceed-2
    - expect: Aparece el formulario de direccion con street, city, state, country (select), postal_code
  3. Completar street, city, state, seleccionar country con selectOption (p.ej. 'AR', no usar fill) y postal_code; click en proceed-3
    - expect: Se muestra el paso de pago con payment-method
  4. Seleccionar payment-method = cash-on-delivery y click en finish
    - expect: Mensaje de pago exitoso (selector por confirmar)
  5. Click en finish/confirmar nuevamente si la app lo pide
    - expect: Se muestra la confirmacion del pedido con un numero de factura (formato y selector por confirmar, no verificado en la exploracion)

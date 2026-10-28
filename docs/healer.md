# Hito 7 - Romper un test y repararlo con el Healer

**Honestidad sobre la herramienta:** el Healer real (agente `playwright-test-healer` con el MCP `playwright-test` del `.mcp.json`) NO estaba disponible en este entorno. Se EMULO siguiendo los pasos de `.claude/agents/playwright-test-healer.md`: correr el test, leer el error y el snapshot (`error-context.md` de Playwright), inspeccionar la pagina real con el navegador del MCP `playwright` (browser_navigate / browser_evaluate sobre `/checkout`) y corregir el locator.

## Que se rompio
Test `RG-08` (`tests/cart/cart.spec.ts`, linea 17). Se cambio el locator
`getByTestId('line-price')` por `getByTestId('line-total-price')` (simula un renombre de `data-test` en la UI).

Commit de ruptura: `c1d6afc` - "Hito 7: rompe test a proposito (locator cambiado)"

## Error
```
Error: expect(locator).toHaveText(expected) failed
Locator: getByTestId('line-total-price')
Expected: "$56.60"
Timeout: 5000ms
Error: element(s) not found
```
Falla por el motivo buscado: el elemento no existe; las acciones previas (PUT del carrito, cantidad 4) funcionaron y el snapshot muestra la linea con $56.60.

## Diagnostico
El snapshot de la pagina muestra la fila con precio $14.15 y total $56.60, o sea la funcionalidad es correcta; solo el locator apunta a un `data-test` inexistente. Se inspecciono el DOM real de `/checkout`: los `data-test` de la tabla son `product-title`, `product-quantity`, `product-price`, `line-price` (SPAN) y `cart-total` (TD). No es un bug del producto, por lo tanto no corresponde `test.fixme()`.

## Fix
Volver a un locator estable por `data-test` real: `getByTestId('line-price')`. Se mantuvo `getByTestId` (testIdAttribute `data-test`), sin CSS/XPath fragil ni esperas arbitrarias.

Commit de reparacion: `0bba430` - "Hito 7: reparacion del test por el Healer"

## Resultado
Suite completa: 15 passed (23.9s), 15/15.

---

## Ronda 2 — Healer REAL (agente playwright-test-healer + MCP playwright-test)

- Rotura intencional: commit `7e1f2b5` (RG-05: `search-submit` -> `search-button`). Fallo: timeout en `locator.click` y `waitForResponse`.
- Se invoco el agente `.claude/agents/playwright-test-healer.md` en una sesion de Claude Code dentro del repo, con el MCP `playwright-test` (`.mcp.json`: `npx playwright run-test-mcp-server`).
- Herramientas MCP usadas: `test_run` (antes y despues) y `test_debug` (el snapshot mostro el boton "Search"). `browser_generate_locator` y `browser_evaluate` fallaron con "Test has already stopped".
- Limite honesto: el snapshot dio el nombre accesible, no el `data-test`; el agente tomo el id del mensaje del commit de rotura. Que RG-05 pase confirma el locator.
- Reparacion: commit `e02233f` (`search-button` -> `search-submit`). RG-05 y RG-06 pasan.

# Hito 5 — Agentes de Playwright ejecutados (Generator real; Planner incompleto)

Se invocaron los agentes de `.claude/agents` en una sesion de Claude Code dentro del repo, con el MCP `playwright-test` (`.mcp.json`).

## Generator (real)
- Agente `playwright-test-generator`, herramientas MCP usadas: `generator_write_test`, `browser_navigate`, `browser_click`, `browser_type`, `browser_select_option`, `browser_press_key`, `browser_snapshot`, `browser_wait_for`, `browser_verify_text_visible`, `browser_verify_element_visible`.
- Salida: `tests/agentes-generados/` (RG-01 a RG-10, un archivo por escenario).
- Resultado: **10/10 pasan** (`npx playwright test tests/agentes-generados`, 23 s).
- Credenciales invalidas con un email inexistente (no se bloquea la cuenta real).

## Planner (real, exploracion incompleta)
- 1er intento: la sesion lo corto a los 10 min y no guardo el plan.
- 2do intento (en primer plano): `playwright-test-planner` guardo `specs/agentes-plan.md` con `planner_save_plan` (136 lineas, RG-01 a RG-10). Herramientas MCP: `planner_setup_page`, `browser_navigate`, `browser_run_code_unsafe` (4 llamadas, la ultima se aborto por timeout), `planner_save_plan`.
- Verificado en el sitio: login valido/vacio, `/account` sin sesion, busqueda "hammer", orden por precio, badge y total del carrito, formulario de direccion del checkout.
- Incompleto: el ultimo paso del checkout se colgo; mensaje de pago exitoso, confirmacion con numero de factura y selector de eliminar del carrito quedaron "por confirmar" en el plan (afecta RG-09 y RG-10).
- Orden real: el Generator corrio ANTES que este plan y trabajo a partir de `specs/regression-plan.md` (escrito a mano). Los tests generados no derivan de `agentes-plan.md`.

## Limites
- RG-05 y RG-06: el agente recorrio la busqueda y el orden en el navegador, pero las aserciones (ej. todos los nombres contienen "hammer") vienen de la suite existente, no de lo observado.
- En carrito, checkout y busqueda, el agente adapto el codigo de `tests/` a mano y agrego esperas y chequeos.
- RG-10 crea una factura real en la demo cada vez que corre.

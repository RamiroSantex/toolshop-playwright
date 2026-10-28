# Hito 5 — Agentes de Playwright ejecutados (Generator real; Planner incompleto)

Se invocaron los agentes de `.claude/agents` en una sesion de Claude Code dentro del repo, con el MCP `playwright-test` (`.mcp.json`).

## Generator (real)
- Agente `playwright-test-generator`, herramientas MCP usadas: `generator_write_test`, `browser_navigate`, `browser_click`, `browser_type`, `browser_select_option`, `browser_press_key`, `browser_snapshot`, `browser_wait_for`, `browser_verify_text_visible`, `browser_verify_element_visible`.
- Salida: `tests/agentes-generados/` (RG-01 a RG-10, un archivo por escenario).
- Resultado: **10/10 pasan** (`npx playwright test tests/agentes-generados`, 23 s).
- Credenciales invalidas con un email inexistente (no se bloquea la cuenta real).

## Planner (no se completo)
- Se lanzo `playwright-test-planner`, pero la sesion lo corto a los 10 min ("background tasks still running") y **no guardo `specs/agentes-plan.md`**.
- El Generator trabajo a partir del plan existente `specs/regression-plan.md` (escrito a mano en la ronda anterior).

## Limites
- RG-05 y RG-06: el agente recorrio la busqueda y el orden en el navegador, pero las aserciones (ej. todos los nombres contienen "hammer") vienen de la suite existente, no de lo observado.
- En carrito, checkout y busqueda, el agente adapto el codigo de `tests/` a mano y agrego esperas y chequeos.
- RG-10 crea una factura real en la demo cada vez que corre.

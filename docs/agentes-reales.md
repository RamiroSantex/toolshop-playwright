# Hito 5 — Planner, Generator y Healer reales (MCP `playwright-test`)

Los agentes de `.claude/agents` se invocaron en sesiones de Claude Code dentro del repo, con el MCP `playwright-test` (`.mcp.json`).

## Flujo ejecutado
1. **Planner** (`playwright-test-planner`): exploro Toolshop y guardo `specs/agentes-plan.md` con `planner_save_plan` (herramientas: `planner_setup_page`, `browser_navigate`, `browser_run_code_unsafe`, `planner_save_plan`). Primer intento cortado a los 10 min; segundo intento completo salvo el final del checkout, que una segunda pasada del Planner confirmo (pago: `finish` "Check payment" -> `payment-success-message` -> "Confirm" -> `#order-confirmation` con numero de factura).
2. **Generator** (`playwright-test-generator`): genero `tests/agentes-generados/` (RG-01 a RG-10) a partir de `specs/agentes-plan.md`. Herramientas: `generator_setup_page`, `generator_read_log`, `generator_write_test`, `browser_navigate/click/type/select_option/press_key/evaluate/snapshot/wait_for`, `browser_verify_text_visible`, `browser_verify_element_visible`. En la primera pasada escribio 9 de 10 (falto RG-10); se genero aparte.
3. **Healer** (`playwright-test-healer`): reparo lo que fallo del Generator.
   - RG-02: buscaba el texto "Login failed" pero la app muestra "Invalid email or password"; ahora verifica `login-error`.
   - RG-05 (flaky): leia los nombres antes de que el listado filtrado reemplazara al inicial; se espera la respuesta de la busqueda.
   - RG-10: carrera con `GET /postcode-lookup` (rellena calle/ciudad/estado y pisa el formulario): pais por valor `AT`, sin `state` manual, esperas de `/postcode-lookup` y `POST /invoices`. Herramientas: `test_run` (~17 corridas), `test_debug`, `browser_snapshot`; `browser_network_requests` fallo ("Must setup test before interacting with the page"). Un ajuste final lo hice yo: llenado y aserciones de campos envueltos en `expect(...).toPass({ timeout: 20000 })`.

## Resultado honesto
- Suite generada, 3 corridas seguidas (`--repeat-each=3`) contra la demo publica: **29/30**. RG-10 fallo 1 de 3 (timeout del `toPass` por una respuesta tardia del lookup). **RG-10 sigue siendo inestable en la demo publica.**
- Las pruebas se corrieron contra la demo publica; en CI corren contra Toolshop levantado con Docker (el check del PR dira si se comporta distinto).
- RG-10 crea una factura real en la app cada vez que corre.

## Limites
- En RG-05 y RG-06 las aserciones no salen de lo observado sino de la suite existente.
- El Generator corrio la primera vez antes del plan completo; la version actual de los tests se regenero desde `specs/agentes-plan.md`.
- El agente que completo el plan lo reescribio entero (no tenia `Edit`); no se reviso linea a linea que RG-01..RG-08 se mantuvieran identicos.

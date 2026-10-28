# toolshop-playwright

Suite Playwright (TypeScript) sobre la app demo Toolshop: https://practicesoftwaretesting.com
(API: https://api.practicesoftwaretesting.com, repo de referencia: testsmith-io/practice-software-testing)

```
npm ci
npx playwright install chromium
npx playwright test            # toda la suite
npx playwright show-report
python scripts/verify-failures.py   # comprueba que cada test falla al romper el comportamiento
```

- `docs/10-casos-regresion.md`: 10 casos candidatos y priorizacion
- `specs/regression-plan.md`: plan de pruebas (formato Planner)
- `docs/verificacion-fallos.md`: evidencia de que los tests fallan cuando deben + registro de healing
- `tests/`: specs (`auth/`, `catalog/`, `cart/`, `checkout/`, `api/`), `support/` helpers, `seed.spec.ts` para los agentes
- `.claude/agents/` + `.mcp.json`: Planner/Generator/Healer generados por `npx playwright init-agents --loop=claude`

## CI
La suite corre en cada pull request (.github/workflows/playwright.yml) y bloquea el merge si falla.

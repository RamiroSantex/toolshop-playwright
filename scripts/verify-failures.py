"""
Verifica que cada test de regresion FALLA cuando el comportamiento esperado se rompe.

La app (Toolshop) es externa: no se puede romper su codigo. Por cada test se aplica UNA mutacion
temporal al spec (equivale a que la app se comporte distinto a lo esperado), se ejecuta solo ese test,
se registra que falle y se restaura el archivo original (bytes exactos, en un finally).

Uso: python scripts/verify-failures.py
"""
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# (id, archivo, texto original, texto mutado, que simula)
MUTATIONS = [
    ("RG-01", "tests/auth/login.spec.ts", "toHaveText(CUSTOMER.name)", "toHaveText('John Doe')",
     "el login muestra otro usuario"),
    ("RG-02", "tests/auth/login.spec.ts", "toHaveText('Invalid email or password')", "toHaveText('Credenciales invalidas')",
     "la app cambia/pierde el mensaje de error ante credenciales invalidas"),
    ("RG-03", "tests/auth/login.spec.ts", "'Email is required'", "'Email is mandatory'",
     "cambia/desaparece el mensaje de validacion de email"),
    ("RG-04", "tests/auth/login.spec.ts", "new LoginPage(page).form).toBeVisible()", "new LoginPage(page).form).toBeHidden()",
     "la app no muestra el formulario de login al redirigir una ruta protegida"),
    ("RG-05", "tests/catalog/catalog.spec.ts", "toMatch(/hammer/i)", "toMatch(/pliers/i)",
     "la busqueda devuelve productos que no coinciden"),
    ("RG-06", "tests/catalog/catalog.spec.ts", "selectOption('price,asc')", "selectOption('price,desc')",
     "el orden por precio ascendente devuelve el orden inverso"),
    ("RG-07", "tests/cart-total.spec.ts", "fmt(2 * priceA + 3 * priceB)", "fmt(2 * priceA + 2 * priceB)",
     "el total del carrito suma una unidad menos"),
    ("RG-08", "tests/cart/cart.spec.ts", "getByTestId('cart-total')).toHaveText(fmt(4 * price))", "getByTestId('cart-total')).toHaveText(fmt(3 * price))",
     "el total no se recalcula bien al cambiar la cantidad"),
    ("RG-09", "tests/cart/cart.spec.ts", ".locator('.btn-danger').click()", ".locator('.btn-danger').hover()",
     "el boton eliminar no elimina la linea"),
    ("RG-10", "tests/checkout/checkout.spec.ts", "toHaveText('Payment was successful')", "toHaveText('Payment failed')",
     "el pago no se verifica y el pedido no puede completarse"),
]


def run(test_id: str):
    # --grep por id: cada titulo empieza con RG-XX. Sin reintentos: un fallo es un fallo.
    p = subprocess.run(
        ["npx", "playwright", "test", "--grep", test_id, "--reporter=line", "--retries=0"],
        cwd=ROOT, capture_output=True, text=True, shell=True,
        env={**os.environ, "NO_COLOR": "1", "FORCE_COLOR": "0"},
    )
    out = p.stdout + p.stderr
    summary = re.findall(r"^\s*(\d+ (?:passed|failed).*)$", out, re.M)
    err = re.search(r"Error: (.+)", out)
    return p.returncode, (summary[-1] if summary else "?"), (err.group(1).strip()[:110] if err else "")


def main():
    results = []
    for test_id, rel, old, new, sim in MUTATIONS:
        path = ROOT / rel
        original = path.read_bytes().decode("utf8")
        if original.count(old) != 1:
            print(f"{test_id}: la mutacion no aplica (ocurrencias={original.count(old)})")
            sys.exit(2)
        try:
            base_rc, base_sum, _ = run(test_id)
            path.write_bytes(original.replace(old, new).encode("utf8"))
            rc, summ, err = run(test_id)
        finally:
            path.write_bytes(original.encode("utf8"))
        verdict = "OK (falla al romperlo)" if rc != 0 and base_rc == 0 else "REVISAR"
        results.append((test_id, base_sum, summ, err, sim, verdict))
        print(f"{test_id} | sin romper: {base_sum} | roto: {summ} | {verdict} | {err}")
    print()
    print("| Caso | Defecto simulado | Sin romper | Roto | Error observado | Veredicto |")
    print("|------|------------------|-----------|------|-----------------|-----------|")
    for r in results:
        print(f"| {r[0]} | {r[4]} | {r[1]} | {r[2]} | `{r[3]}` | {r[5]} |")


if __name__ == "__main__":
    main()

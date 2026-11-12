#!/bin/bash
# Repo mínimo con un cambio que introduce un bug de paginación (devuelve un elemento de más).
set -euo pipefail
git init -q -b main .
git config user.email eval@example.com
git config user.name eval
mkdir -p src
cat > src/listado.js <<'JS'
export function listar(items) {
  return items.filter(item => item.visible)
}
JS
git add -A && git commit -qm base
cat > src/listado.js <<'JS'
export function listar(items) {
  return items.filter(item => item.visible)
}

// Devuelve la página `pagina` (empezando en 0) con `tam` elementos.
export function paginar(items, pagina, tam) {
  const inicio = pagina * tam
  return items.slice(inicio, inicio + tam + 1)
}
JS
git add -A && git commit -qm "feat: paginar listados"
git diff main~1...HEAD > diff.patch

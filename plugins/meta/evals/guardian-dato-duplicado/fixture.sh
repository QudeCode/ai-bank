#!/bin/bash
# Proyecto con el comando de tests declarado en dos sitios y con valores distintos.
set -euo pipefail
mkdir -p .claude/context
cat > CLAUDE.md <<'MD'
# Proyecto de ejemplo

## Comandos
- Tests: `npm run test:unit`
- Lint: `npm run lint`
MD
cat > .claude/context/verificador.md <<'MD'
# Contexto · verificador

## Comprobaciones
- Tests: `npm test -- --runInBand`

## Gotchas
- Ninguno conocido.
MD
cat > package.json <<'JSON'
{ "name": "ejemplo", "scripts": { "test:unit": "vitest run", "lint": "eslint ." } }
JSON

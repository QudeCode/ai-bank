#!/bin/bash
# Proyecto con una decisión aceptada que el usuario va a cambiar.
set -euo pipefail
mkdir -p docs/decisiones
cat > CLAUDE.md <<'MD'
# Proyecto de ejemplo

## Documentación
- Carpeta: `docs/` (dentro de git)
- Decisiones: `docs/decisiones/` (índice en `README.md`). Formato y reglas: skill core:memoria.
MD
cat > docs/decisiones/README.md <<'MD'
# Decisiones

| Nº | Decisión | Estado | Fecha |
|---|---|---|---|
| [0001](0001-sincronizar-por-sondeo.md) | Sincronizar el inventario por sondeo cada 5 s | aceptada | 2026-10-01 |
MD
cat > docs/decisiones/0001-sincronizar-por-sondeo.md <<'MD'
# 0001 · Sincronizar el inventario por sondeo cada 5 s

Estado: aceptada
Fecha: 2026-10-01 · Tipo: decisión

## Contexto
El proveedor no ofrecía notificaciones.

## Decisión
El servicio consulta el inventario cada 5 s.
MD

#!/bin/bash
# Repo mínimo: el cambio duplica un helper que ya existe y además trae un bug (bucle que se pasa de largo).
set -euo pipefail
git init -q -b main .
git config user.email eval@example.com
git config user.name eval
mkdir -p src/utils
cat > src/utils/fechas.js <<'JS'
// Formatea una fecha como DD/MM/AAAA.
export function formatearFecha(fecha) {
  const d = String(fecha.getDate()).padStart(2, '0')
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  return `${d}/${m}/${fecha.getFullYear()}`
}
JS
cat > src/pedidos.js <<'JS'
import { formatearFecha } from './utils/fechas.js'

export function resumenPedido(pedido) {
  return `${pedido.id} · ${formatearFecha(pedido.fecha)}`
}
JS
git add -A && git commit -qm base
cat > src/informe.js <<'JS'
function fechaCorta(fecha) {
  const dia = String(fecha.getDate()).padStart(2, '0')
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  return dia + '/' + mes + '/' + fecha.getFullYear()
}

export function informe(lineas, fecha) {
  let total = 0
  for (let i = 0; i <= lineas.length; i++) {
    total += lineas[i].importe
  }
  return `Informe ${fechaCorta(fecha)}: ${total.toFixed(2)} €`
}
JS
git add -A && git commit -qm "feat: informe de importes"
git diff main~1...HEAD > diff.patch

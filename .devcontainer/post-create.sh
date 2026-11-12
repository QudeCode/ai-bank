#!/usr/bin/env bash
# Se ejecuta una vez, al crear el contenedor.
set -euo pipefail

# Los volúmenes nuevos se crean a nombre de root.
sudo chown node:node /home/node/.config
sudo chown -R node:node /home/node/.claude /home/node/.config/gh
if [[ -d node_modules ]]; then
  sudo chown -R node:node node_modules
fi

# Red corporativa que intercepta TLS: los .crt de .devcontainer/certificados/
# (no se versionan) pasan al almacén del sistema, que también usa Node (NODE_EXTRA_CA_CERTS).
shopt -s nullglob
certificados=(.devcontainer/certificados/*.crt)
if ((${#certificados[@]} > 0)); then
  sudo cp "${certificados[@]}" /usr/local/share/ca-certificates/
  sudo update-ca-certificates
fi

# El repositorio viene del anfitrión con otro propietario.
git config --global --add safe.directory "$PWD"

if [[ -f package-lock.json ]]; then
  npm ci --no-audit --no-fund
elif [[ -f package.json ]]; then
  npm install --no-audit --no-fund
fi

echo
echo "Contenedor listo. Solo la primera vez:"
echo "  claude                               # iniciar sesión en Claude Code"
echo "  gh auth login && gh auth setup-git   # para hacer push desde el contenedor"

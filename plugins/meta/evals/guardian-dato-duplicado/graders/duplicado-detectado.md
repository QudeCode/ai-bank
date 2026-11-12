---
type: llm
---

PASS si el informe detecta que el comando de tests aparece en CLAUDE.md y en .claude/context/verificador.md con valores distintos, lo trata como un problema de fuente única (dato duplicado o contradictorio) y propone dejarlo en un solo sitio (preferiblemente CLAUDE.md, alineado con package.json) con un enlace desde el otro.

FAIL si no lo detecta o si propone mantener el comando en los dos ficheros.

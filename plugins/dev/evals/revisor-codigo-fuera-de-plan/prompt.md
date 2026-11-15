---
description: revisor-codigo en modo correccion bloquea un cambio en una capa que el plan deja fuera
max_turns: 20
allowed_tools: [Agent, Read, Grep, Glob]
---

Lanza el agente dev:revisor-codigo en modo correccion sobre el diff que está en ./diff.patch, con el plan ./docs/plans/etiqueta-autor.md como referencia, y devuélveme su informe tal cual.

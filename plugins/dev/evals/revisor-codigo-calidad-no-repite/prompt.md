---
description: revisor-codigo en modo calidad señala la duplicación y deja el bug para el modo correccion
max_turns: 20
allowed_tools: [Agent, Read, Grep, Glob]
---

Lanza el agente dev:revisor-codigo en modo calidad sobre el diff que está en ./diff.patch y devuélveme su informe tal cual, sin añadir comentarios tuyos.

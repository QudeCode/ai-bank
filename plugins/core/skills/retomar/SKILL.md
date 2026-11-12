---
name: retomar
description: Al empezar una sesión sobre un trabajo ya empezado, reconstruye dónde se quedó — nota de trabajo del ticket o la rama, plan, decisiones relacionadas, git log y git status — y propone el siguiente paso. Úsala al abrir un chat nuevo para continuar un ticket.
disable-model-invocation: true
argument-hint: "[ticket o rama]"
---

# Retomar

Sigue la skill `core:memoria` para saber dónde vive cada cosa. `<docs>` es la carpeta de documentación del `CLAUDE.md` (por defecto, `docs/`).

## Pasos

1. **Qué trabajo es.** `$ARGUMENTS` si lo hay; si no, la rama actual (`git branch --show-current`) y el ticket que contenga su nombre. Busca `<docs>/notas/<ticket-o-rama>.md`. Si no existe:
   - mira `<docs>/notas/`;
   - si hay varias candidatas, pregunta cuál;
   - si no hay ninguna, dilo y reconstruye solo desde git y el plan.
2. **Lee**, solo lo necesario:
   - la nota;
   - el plan que enlaza (objetivo, definición de hecho, tareas);
   - las decisiones que enlaza y las del índice posteriores a la fecha de la nota;
   - las entradas de `hallazgos.md` posteriores a esa fecha.
3. **Contrasta con git**:
   - `git status --short`;
   - `git log --oneline` desde la fecha de la nota (o los 10 últimos);
   - `git stash list`.

   Señala en qué no coincide git con la nota: commits que la nota no recoge, ficheros «sin commit» que ya no lo están, cambios no explicados.
4. **Resume**, en 10 líneas como máximo:
   - dónde lo dejaste;
   - qué cambió desde entonces;
   - el **siguiente paso** concreto;
   - las preguntas abiertas que bloquean.
5. Si la nota está desfasada, propone el texto corregido. Escríbelo solo si el usuario lo aprueba.

No empieces a implementar: espera a que el usuario confirme el siguiente paso.

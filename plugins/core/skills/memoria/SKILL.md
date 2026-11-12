---
name: memoria
description: Memoria y documentación viva del proyecto — dónde se apunta cada cosa (decisiones, hallazgos verificados, notas de trabajo entre sesiones, glosario, planes) y cómo se mantiene coherente en el tiempo. Úsala al tomar o cambiar una decisión, al descubrir algo que costó averiguar o que contradice la documentación, al pausar o retomar trabajo, y antes de proponer algo que pueda chocar con lo ya decidido.
---

# Memoria del proyecto

Cada sesión empieza sin memoria. Lo que no esté escrito en el sitio adecuado se pierde o se vuelve a discutir. Cada tipo de dato tiene **un solo sitio**:

| Qué | Dónde | Quién escribe |
|---|---|---|
| Reglas y comandos | `CLAUDE.md` | Usuario (Claude propone) |
| Lo que necesita un rol | `.claude/context/<agente>.md` | Usuario (los agentes proponen) |
| **Decisiones** | `<docs>/decisiones/NNNN-slug.md` + índice `README.md` | Claude propone, **el usuario acepta** |
| **Hallazgos verificados** | `<docs>/hallazgos.md` | Claude, avisando |
| **Notas de trabajo** | `<docs>/notas/<ticket-o-rama>.md` | Claude |
| Vocabulario del dominio | `<docs>/GLOSSARY.md` (skill `dev:modelo-dominio`) | Claude propone |
| Planes | `<docs>/plans/<slug>.md` (agente `dev:arquitecto`) | Claude |
| Preferencias personales | auto memory de Claude (local, no va al proyecto) | Claude |

`<docs>` es la carpeta de documentación que declara el `CLAUDE.md` del proyecto (sección «Documentación»); por defecto, `docs/`. Puede estar **fuera de git** si el proyecto lo decide; entonces los cambios de código descartados no la revierten, así que hay que comprobar que sigue describiendo el código confirmado. Formatos exactos: [references/formatos.md](references/formatos.md).

## Decisiones

- **Se registra** una decisión cuando:
  - se eligió entre alternativas reales y alguien podría proponer la contraria más adelante;
  - o el usuario la toma explícitamente («haz X, no Y»).

  No se registra lo obvio ni lo que el código ya dice por sí solo.
- Las decisiones de peso (difíciles de revertir, sorprendentes sin contexto y fruto de un compromiso real) llevan la marca **ADR**. Van en la misma serie: una sola fuente.
- **Estados**: `propuesta` → `aceptada` → `sustituida por NNNN` u `obsoleta`. Claude solo escribe `propuesta`; pasa a `aceptada` cuando el usuario la acepta.
- **No se reescriben ni se borran.** Para cambiar de criterio, se crea una decisión nueva con «Sustituye a NNNN» y en la vieja solo se cambia el estado. Así se ve cómo se ha ido afinando el criterio.
- **El índice** (`decisiones/README.md`) se actualiza en el mismo paso: número, título, estado y fecha.
- **Antes de proponer** un plan o un cambio, busca las decisiones vigentes que le afecten. Si lo que propones contradice una, dilo explícitamente y propón sustituirla. No la ignores.

## Hallazgos verificados

- Se añade un hallazgo cuando algo:
  - costó más de unos minutos averiguarlo;
  - contradice la documentación o lo que se creía;
  - o describe el comportamiento real de un sistema externo.
- **Solo se añade, nunca se reescribe.** Cada entrada lleva fecha, lo verificado, la **evidencia** (cómo se comprobó) y qué contradice.
- Si deja de ser cierto, se marca «~~superado~~ (fecha, motivo)». No se borra.
- Las trampas que afectan a todo el trabajo se resumen además en los Gotchas del `CLAUDE.md` o del contexto, con un enlace al hallazgo.

## Notas de trabajo

- Una por ticket o rama. Son el **estado actual**, no un diario: se reescriben, no se añaden entradas.
- Contienen: objetivo, hecho, pendiente, **siguiente paso**, ficheros sin commit, preguntas abiertas y enlaces (plan, decisiones).
- Se actualizan al pausar (`/core:traspaso`) y se leen al volver (`/core:retomar`).
- Al cerrar el ticket, la nota se mueve a `notas/archivo/` con un resumen de tres líneas.

## La documentación sigue al código

Un cambio que deja desfasado un documento (diagrama, glosario, decisión, hallazgo, `CLAUDE.md`) lo actualiza **en el mismo paso**. Si no se puede, se apunta como pendiente en la nota de trabajo.

## Gotchas

- Una nota que crece como diario deja de leerse: si pasa de una pantalla, resúmela.
- Una decisión editada «para afinarla» borra el porqué original. Sustitúyela.
- Copiar una decisión en `CLAUDE.md` crea dos fuentes. `CLAUDE.md` enuncia la regla en una línea y enlaza la decisión.
- Las reglas de autoría del proyecto (p. ej. no mencionar herramientas de IA en lo que llega al repo) aplican también a la documentación que esté dentro de git.

---
name: orquestacion
description: Cómo repartir el trabajo entre la sesión principal, los subagentes y los workflows del banco (dev, meta). Úsala al planificar o ejecutar una feature con varios pasos, antes de lanzar un subagente o un workflow, al escribir un encargo para un agente o al recibir sus resultados. No hace falta para preguntas sueltas ni cambios triviales.
---

# Orquestación

La sesión principal coordina: habla con el usuario, decide qué se delega, escribe los encargos, junta los resultados y se ocupa de git. Los subagentes no ven la conversación ni pueden lanzar otros subagentes.

## Cuándo delegar

Delega solo si se cumple una de estas condiciones:

- **Revisión con ojos limpios**: un plan o un diff revisado por quien no lo escribió (`dev:revisor-plan`, `dev:revisor-codigo`, `dev:revisor-ux`).
- **Leer mucho y devolver poco**: explorar un área grande, auditar o investigar (`dev:arquitecto`, `meta:*`).
- **Trabajo independiente en paralelo**: unidades sin dependencias entre sí y con un plan cerrado (`dev:implementador`, uno por unidad).
- **Menos herramientas**: una tarea que debe ser de solo lectura.

No delegues:

- Trabajo secuencial en el que cada paso depende del anterior.
- Dos agentes que editan los mismos ficheros.
- Tareas pequeñas.
- Delegar para «obtener mejor respuesta»: no mejora nada; un revisor nuevo sí.

**Un solo escritor.** Por defecto implementa la sesión principal. Si hay varios implementadores en paralelo, cada uno tiene ficheros disjuntos.

## Flujo de una feature

1. **Entender.** Si hay que leer mucho código, delega la exploración.
2. **Plan.** `dev:arquitecto` redacta el plan como contrato. Si devuelve «Preguntas», házselas al usuario todas juntas y **continúa el mismo agente** con las respuestas, sin lanzar uno nuevo.
3. **Revisar el plan.** `/dev:revisar-plan <ruta>` (los cuatro roles en paralelo) o `dev:revisor-plan` con un rol. Corrige el plan con los hallazgos.
4. **Aprobación del usuario** del plan.
5. **Implementar.** Por defecto, en la sesión principal. Usa `dev:implementador` solo para tareas del plan marcadas como paralelizables.
6. **Verificar y revisar.** `/dev:revisar-cambios` o, a mano, `dev:verificador` + `dev:revisor-codigo` (`correccion` y `calidad`) + `dev:revisor-ux` si toca UI, en paralelo.
7. **Corregir** lo que bloquea y volver a verificar.
8. **Commit** según la política del `CLAUDE.md` del proyecto. Los subagentes nunca hacen commit.
9. **Cierre:** `/core:retro`.

Un workflow no puede pararse a preguntar: úsalo para tramos automáticos (revisar, auditar), no para lo que necesita aprobación.

## Escribir un encargo

El encargo es todo el contexto del agente. Incluye:

- **Objetivo** en una frase y, si aplica, el **modo o rol** del agente.
- **Artefactos**: ruta del plan, ruta del fichero con el diff, ficheros o directorios en juego.
- **Límites**: qué puede tocar y qué no.
- **Lo que ya se sabe** y que el agente no puede deducir (decisiones de la conversación, respuestas del usuario).
- **Condición de parada** y **qué debe devolver**, si difiere de su formato de entrega.

No copies el `CLAUDE.md` ni el contexto del proyecto: el agente ya los lee.

### Diff para revisores (no tienen Bash)

```bash
git diff <base>...HEAD > "$TMP/diff.patch"; git diff >> "$TMP/diff.patch"
git diff --stat <base>...HEAD > "$TMP/diff.stat"
```

`$TMP` es el scratchpad de la sesión o un directorio temporal fuera del repo. La rama base está en el contexto del proyecto; si no, pregúntala. Pasa las rutas en el encargo. Para revisar la salida de validadores o tests, guárdala igual en un fichero.

## Al recibir resultados

- Pasa a otros agentes lo que devolvió uno **íntegro**, sin parafrasear.
- Junta las preguntas de todos los agentes en **un solo mensaje** al usuario.
- Tras cualquier escritura de un agente, comprueba con `git status --short` que solo cambió lo esperado.
- Las «Propuestas para el contexto» de los agentes se enseñan al usuario. Solo se escriben en `.claude/context/` si las aprueba. Las marcadas «(generalizable)» se guardan para `/core:retro`.

## Contexto del proyecto

Cada agente del banco lee `.claude/context/<agente>.md`. Si un agente informa de que falta, propón `/core:init-context`.

## Gotchas

- Los agentes de plugin ignoran `permissionMode` y `hooks`. El «solo lectura» lo imponen sus `tools`. Por eso los revisores necesitan el diff en un fichero.
- Un subagente no hereda lo hablado en la conversación: lo que no esté en el encargo no existe para él.
- Los workflows cuentan tokens de cada agente que lanzan. Para cambios pequeños, un revisor directo basta.

---
name: retro
description: Retrospectiva al cerrar una sesión o una feature. Propone actualizaciones al contexto específico del proyecto (.claude/context/, CLAUDE.md) y envía al banco ai-bank, como issues de GitHub, los aprendizajes que parecen generalizables, con el cambio exacto sugerido.
disable-model-invocation: true
argument-hint: "[tema o feature]"
---

# Retro

Cierra el ciclo de mejora en sus dos capas:
- **Específica**: el contexto de este proyecto.
- **Común**: los agentes y skills del banco, que solo se cambian en el banco, vía `/core:promocionar`.

## 0. Traspaso

Si hay trabajo de la sesión sin traspasar, ejecuta primero los pasos de `/core:traspaso`: nota de trabajo, hallazgos, decisiones y documentación al día. La retro se ocupa de aprender; el traspaso, de no perder el estado.

## 1. Recoge

Revisa la sesión (o la feature `$ARGUMENTS`):
- Correcciones del usuario a ti o a los agentes.
- Hallazgos que se repitieron y fallos de los agentes (los que no siguieron su contexto, inventaron hallazgos, se dejaron algo o pidieron un dato que ya existía).
- «Propuestas para el contexto» que no se aplicaron.
- Decisiones tomadas y comandos o trampas que se descubrieron.

Mira también `git log` y `git diff --stat` de la sesión, y los `.claude/context/*.md` actuales.

## 2. Clasifica cada aprendizaje

| Tipo | Prueba | Destino |
|---|---|---|
| **Específico** | Nombra módulos, rutas, decisiones o dominio de este proyecto | `.claude/context/<agente>.md`, `CLAUDE.md`, una skill del proyecto, `<docs>/decisiones/` o `<docs>/hallazgos.md` (un solo sitio; ver `core:memoria`) |
| **Regla sin excepción** | Se incumplió más de una vez y no admite excepciones | Hook o regla de denegación en `.claude/settings.json` (propón el JSON exacto) |
| **Generalizable** | Tendría sentido en otro proyecto sin cambiar nombres; es método, rol, formato o un fallo del agente común; el banco no lo cubre ya | Issue en el banco |
| **Ruido** | Puntual o ya cubierto | Se descarta, diciendo por qué |

## 3. Propón

Muestra al usuario, en este orden:

- **A. Contexto del proyecto**: por fichero, sección y texto exacto que se añade, cambia o quita. Prioriza la sección **Gotchas**.
- **B. Reglas sin excepción**: el JSON del hook o del `permissions.deny`.
- **C. Candidatos al banco**: por cada uno, el componente (`dev:revisor-codigo`, `core:orquestacion`…), la situación real **anonimizada**, el cambio exacto (sección: texto actual → texto propuesto), por qué es generalizable y un caso para eval (prompt realista y qué debe pasar o no pasar).
- **D. Descartados**, en una línea cada uno.

Pregunta qué se aplica. Aplica A y B solo con aprobación.

## 4. Envía los candidatos aprobados al banco

Por cada candidato aprobado, abre un issue en `QudeCode/ai-bank` con la etiqueta `propuesta`. Sigue el formato de `.github/ISSUE_TEMPLATE/propuesta.md` del banco (sus secciones están en el paso 3, C).

```bash
gh issue create --repo QudeCode/ai-bank --label propuesta --title "<componente>: <cambio>" --body-file <fichero temporal>
```

- Antes de crearlo, enseña el texto final y pide confirmación: el issue sale del proyecto.
- **Anonimiza**: sin nombre del proyecto ni del cliente, sin rutas, hosts, credenciales ni datos de negocio.
- Busca antes si existe un issue parecido (`gh issue list --repo QudeCode/ai-bank --label propuesta --search "<palabras>"`). Si existe, comenta en él («visto también en otro proyecto»): eso cuenta para promocionarlo.
- Si `gh` no está disponible o no tiene sesión, entrega el texto del issue listo para pegar.

## Gotchas

- Lo que pasó una sola vez rara vez es generalizable. Un fallo real de un agente común sí lo es: documéntalo bien.
- No metas en el banco decisiones de un proyecto disfrazadas de regla general («no usar Tailwind» es del proyecto; «no meter estilos estáticos inline» puede ser general).

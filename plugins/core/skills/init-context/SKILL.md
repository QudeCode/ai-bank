---
name: init-context
description: Inicializa o actualiza el contexto específico de un proyecto para el banco ai-bank — CLAUDE.md, .claude/context/<agente>.md y el esqueleto de memoria del proyecto (decisiones, hallazgos, notas de trabajo) — analizando el código para rellenar las plantillas. Úsala al adoptar el banco en un proyecto existente o cuando un agente avise de que le falta su contexto.
disable-model-invocation: true
argument-hint: "[agente ...]"
---

# Inicializar el contexto del proyecto

Los agentes del banco son comunes y no se editan en el proyecto. Lo específico va en el proyecto, cada dato en un solo sitio (ver `core:memoria`):

| Qué | Dónde |
|---|---|
| Comandos, reglas duras, git y autoría, idioma, dónde está la documentación | `CLAUDE.md`, corto (<200 líneas) |
| Lo que solo necesita un rol | `.claude/context/<agente>.md` |
| Decisiones, hallazgos, notas de trabajo, glosario, planes | La carpeta de documentación (`<docs>`, por defecto `docs/`) |
| Conocimiento extenso que se consulta a veces | Skills del proyecto en `.claude/skills/` |

No escribas lo que Claude puede deducir leyendo el código (estructura de carpetas, stack evidente).

Plantillas:
- `${CLAUDE_PLUGIN_ROOT}/templates/project/CLAUDE.md`
- `${CLAUDE_PLUGIN_ROOT}/templates/project/.claude/context/<agente>.md`
- `${CLAUDE_PLUGIN_ROOT}/templates/project/docs/`

## Pasos

1. **Alcance.** Si `$ARGUMENTS` nombra agentes, solo esos. Si no, los de los plugins activos en `.claude/settings.json` (`enabledPlugins`):
   - `dev@ai-bank` → arquitecto, revisor-plan, implementador, verificador, revisor-codigo, revisor-ux;
   - `meta@ai-bank` → arquitecto-agentes, guardian, investigador.

   Si no hay nada configurado, pregunta.
2. **Estado actual.** Lee `CLAUDE.md`, `.claude/` (context, skills, agents, settings) y la documentación existente. **Nunca sobrescribas**: lo que ya existe se actualiza con un diff propuesto.
3. **Documentación y memoria.**
   - Localiza la carpeta de documentación. Puede estar fuera del repo git a propósito; respétalo.
   - Mapea lo que ya existe a las capas de `core:memoria`:
     - ADR o decisiones → `decisiones/`;
     - hallazgos o *findings* → `hallazgos.md`;
     - glosario;
     - planes;
     - notas por ticket.
   - Para cada capa que falte, propone crear el esqueleto desde la plantilla `docs/`.
   - Para lo que ya existe con otro formato o nombre, propone conservarlo y declararlo en `CLAUDE.md`, o migrarlo. **Pregunta antes**: no renombres ni migres por tu cuenta.
4. **Analiza el repo**, leyendo solo lo necesario:
   - `README*`, manifiestos y scripts;
   - CI y config de lint, formato y tests;
   - `git log --oneline -40` y la rama principal;
   - las convenciones de commit (formato y política de autoría);
   - dónde están las piezas reutilizables.
5. **Reglas que mandan sobre el banco.** Busca en `CLAUDE.md` reglas que contradigan el método por defecto de los agentes (p. ej. «sin tests», «sin atribución de IA», un idioma, una plataforma fuera de alcance). Reflejalas en los contextos de los agentes afectados (implementador, revisor-codigo, revisor-plan, verificador) para que no las incumplan.
6. **Skills duplicadas.** Si `.claude/skills/` (o `.agents/skills/`) contiene skills que cubren lo mismo que el banco (diseño de código, refactor, clean code, glosario y ADR, mejora de arquitectura), propone quitarlas a favor de los equivalentes del banco:
   - diseño, refactor y clean code → `dev:diseno-codigo`;
   - glosario y ADR → `dev:modelo-dominio` + `core:memoria`;
   - mejora de arquitectura → el workflow `/dev:mejorar-arquitectura`.

   Indica qué se perdería, si algo, y conserva lo propio del proyecto. Si `.claude/` está fuera de git, propón archivarlas (p. ej. `.claude/skills-archive/`) en lugar de borrarlas.
7. **Rellena cada plantilla** solo con lo que puedas comprobar, citando de dónde sale (`(de package.json)`). Lo que no sepas, déjalo como `<!-- PENDIENTE: … -->` y apúntalo como pregunta. Borra las secciones que no apliquen. Los comandos van al `CLAUDE.md`; los contextos los enlazan.
8. **Stack.** Si detectas NestJS/TypeORM o React, propón activar `stack-nestjs@ai-bank` o `stack-react@ai-bank` y dilo en los contextos de `implementador` y `revisor-codigo`.
9. **Enseña el borrador** antes de escribir:
   - una tabla por fichero, nuevo o diff;
   - las migraciones de documentación propuestas;
   - las skills que propones quitar;
   - las preguntas, numeradas.

   Escribe solo lo aprobado.
10. **Cierre.** Lista lo que queda `PENDIENTE` y recuerda el ciclo: los agentes proponen ampliaciones del contexto; `/core:traspaso` y `/core:retomar` mantienen la memoria entre sesiones; `/core:retro` consolida.

## Gotchas

- Nunca copies valores de `.env`, credenciales, hosts internos ni datos de clientes a los contextos ni a la documentación.
- Si hay skills del proyecto con conocimiento de arquitectura, el contexto **enlaza** a ellas, no las resume.
- Un contexto largo se ignora. Cada `context/<agente>.md` debería caber en una pantalla o dos.
- Un `CLAUDE.md` largo y valioso (Gotchas, flujos) no se recorta por norma: propón mover a una skill o a la documentación solo lo que no hace falta en cada sesión.

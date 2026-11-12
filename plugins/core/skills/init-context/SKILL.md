---
name: init-context
description: Inicializa o actualiza el contexto específico de un proyecto para los agentes del banco (.claude/context/<agente>.md y CLAUDE.md), analizando el código para rellenar las plantillas. Úsala al adoptar el banco en un proyecto existente o cuando un agente avise de que le falta su contexto.
disable-model-invocation: true
argument-hint: "[agente ...]"
---

# Inicializar el contexto del proyecto

Los agentes del banco son comunes y no se editan en el proyecto. Lo específico va en el proyecto:

| Qué | Dónde |
|---|---|
| Comandos (build, test, lint), reglas duras, política de commits, idioma | `CLAUDE.md`, corto (<200 líneas) |
| Lo que solo necesita un rol | `.claude/context/<agente>.md` |
| Conocimiento extenso que se consulta a veces (arquitectura, convenciones de UI…) | Skills del proyecto en `.claude/skills/` |

Un dato vive en un solo sitio; los demás enlazan. No escribas lo que Claude puede deducir leyendo el código (estructura de carpetas, stack evidente).

Plantillas:
- `${CLAUDE_PLUGIN_ROOT}/templates/project/CLAUDE.md`
- `${CLAUDE_PLUGIN_ROOT}/templates/project/.claude/context/<agente>.md`

## Pasos

1. **Alcance.** Si `$ARGUMENTS` nombra agentes, solo esos. Si no, los de los plugins activos en `.claude/settings.json` (`enabledPlugins`): `dev@ai-bank` → arquitecto, revisor-plan, implementador, verificador, revisor-codigo, revisor-ux; `meta@ai-bank` → arquitecto-agentes, guardian, investigador. Si no hay nada configurado, pregunta.
2. **Estado actual.** Lee `CLAUDE.md`, `.claude/context/`, `.claude/skills/`, `.claude/agents/` y `.claude/settings.json` si existen. **Nunca sobrescribas**: lo que ya existe se actualiza con un diff propuesto.
3. **Analiza el repo**, leyendo solo lo necesario:
   - `README*`, manifiestos (`package.json`, `pyproject.toml`, `go.mod`…), scripts (`package.json#scripts`, `Makefile`, `justfile`).
   - CI (`.github/workflows/`, `.gitlab-ci.yml`), config de lint, formato y tests.
   - `git log --oneline -40` y la rama principal (`git symbolic-ref refs/remotes/origin/HEAD` o la que use el CI).
   - `docs/adr/`, `GLOSSARY.md`, docs de arquitectura.
   - Patrones de reutilización: carpetas de componentes, utilidades y helpers comunes.
4. **Rellena cada plantilla** solo con lo que puedas comprobar, citando de dónde sale (`(de package.json)`). Lo que no sepas, déjalo como `<!-- PENDIENTE: … -->` y apúntalo como pregunta. Borra las secciones que no apliquen. Los comandos van al `CLAUDE.md`; los contextos los enlazan.
5. **Stack.** Si detectas NestJS/TypeORM o React, propón activar `stack-nestjs@ai-bank` o `stack-react@ai-bank`. Indica en `context/implementador.md` y en `context/revisor-codigo.md` qué skill de stack cargar.
6. **Enseña el borrador** antes de escribir: una tabla por fichero (nuevo o diff) y las preguntas numeradas. Escribe solo lo aprobado.
7. **Cierre.** Lista lo que queda `PENDIENTE` y recuerda que los agentes propondrán ampliaciones con el uso y que `/core:retro` las consolida.

## Gotchas

- Nunca copies valores de `.env`, credenciales, hosts internos ni datos de clientes a los contextos: van al repo.
- Si hay skills del proyecto con conocimiento de arquitectura (p. ej. `.claude/skills/architecture`), el contexto **enlaza** a ellas, no las resume.
- Un contexto largo se ignora. Cada `context/<agente>.md` debería caber en una pantalla o dos.

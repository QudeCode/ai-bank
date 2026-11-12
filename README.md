# ai-bank

Banco personal de agentes, skills y workflows para Claude Code, distribuido como **marketplace de plugins**.

- **Lo común vive aquí**: roles, métodos, formatos de salida, workflows y conocimiento de stack.
- **Lo específico vive en cada proyecto**: `CLAUDE.md` y `.claude/context/<agente>.md`, que los agentes leen antes de actuar.
- Los dos se mejoran con el uso: el proyecto ajusta su contexto y lo generalizable vuelve al banco.

## Plugins

| Plugin | Tipo | Componentes |
|---|---|---|
| `core` | Base y gestión | Skills: `orquestacion`, `memoria`, `/core:init-context`, `/core:retomar`, `/core:traspaso`, `/core:retro`, `/core:promocionar` |
| `dev` | Desarrollo | Agentes: `arquitecto`, `revisor-plan`, `implementador`, `verificador`, `revisor-codigo` (modos `correccion` y `calidad`), `revisor-ux`. Skills: `diseno-codigo`, `modelo-dominio`. Workflows: `/dev:revisar-plan`, `/dev:revisar-cambios`, `/dev:mejorar-arquitectura` |
| `meta` | Meta | Agentes: `guardian`, `arquitecto-agentes`, `investigador`. Workflow: `/meta:auditar-proyecto` |
| `stack-nestjs` | Stack | Skills: `nestjs-backend`, `typeorm-datos` |
| `stack-react` | Stack | Skill: `react-frontend` |

`dev` y `meta` no declaran dependencia de `core` (rompería los evals aislados), pero lo usan: actívalos juntos, como hace la plantilla. Los agentes se invocan con prefijo (`dev:revisor-codigo`, o `@agent-dev:revisor-codigo`).

Flujo de una feature (detalle en la skill `core:orquestacion`):

```
/core:retomar → dev:arquitecto (plan como contrato) → /dev:revisar-plan → aprobación → implementar (sesión principal;
dev:implementador solo en paralelo) → /dev:revisar-cambios → commit con aprobación → /core:traspaso | /core:retro
```

## Memoria del proyecto

Para que nada se pierda entre sesiones y las decisiones se mantengan coherentes en el tiempo (skill `core:memoria`), cada proyecto tiene en su carpeta de documentación (por defecto `docs/`; puede estar fuera de git):

| Qué | Dónde | Regla |
|---|---|---|
| Decisiones | `decisiones/NNNN-slug.md` + índice | Una sola serie (las de peso, «Tipo: ADR»). No se reescriben: se **sustituyen**, para ver cómo se afina el criterio |
| Hallazgos verificados | `hallazgos.md` | Solo se añaden entradas, cada una con evidencia; lo que deja de ser cierto se tacha |
| Notas de trabajo | `notas/<ticket>.md` | Estado actual para retomar: `/core:traspaso` al pausar, `/core:retomar` al volver |
| Glosario y planes | `GLOSSARY.md`, `plans/` | `dev:modelo-dominio`, `dev:arquitecto` |

Las preferencias personales siguen en la auto memory de Claude (local). Los agentes respetan las decisiones vigentes, y `/meta:auditar-proyecto` detecta documentación desfasada.

## Usar el banco en un proyecto

### Proyecto nuevo o existente

1. Copia la plantilla en la raíz del proyecto, sin pisar lo que ya exista:

   ```bash
   cp -rn <ruta-a-ai-bank>/templates/project/. .
   ```

   Si no tienes el banco clonado, crea a mano `.claude/settings.json` con el contenido de `templates/project/.claude/settings.json`.
2. Ajusta `enabledPlugins` en `.claude/settings.json`. Activa `stack-nestjs` o `stack-react` si el proyecto los usa.
3. Abre Claude Code en el proyecto y **acepta la confianza de la carpeta**: sin ella, el marketplace del proyecto se ignora.
4. Instala los plugins una vez por persona (`enabledPlugins` los activa, pero no los instala):

   ```bash
   claude plugin install core@ai-bank --scope project
   claude plugin install dev@ai-bank --scope project
   claude plugin install meta@ai-bank --scope project
   ```

   Si el marketplace no aparece, añádelo a mano: `/plugin marketplace add QudeCode/ai-bank`. Para un repo privado necesitas credenciales de git ya guardadas (`gh auth login && gh auth setup-git`). Sin clave SSH de GitHub, exporta `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1`.
5. Rellena el contexto: `/core:init-context`. Analiza el repo, completa `CLAUDE.md` y `.claude/context/*.md`, y te enseña el borrador antes de escribir.
6. Haz commit de `CLAUDE.md` y `.claude/` (`settings.json` y `context/`).

### Actualizar

- La plantilla activa `autoUpdate` para `ai-bank`: los plugins se actualizan solos al arrancar cuando sube su versión.
- A mano: `/plugin marketplace update ai-bank` o `claude plugin update dev@ai-bank`.
- Si la actualización automática falla en un repo privado, revisa las credenciales de git.

## Ciclo de mejora

```
proyecto ─ uso ─► el agente propone «Propuestas para el contexto» ─► (apruebas) ─► .claude/context/<agente>.md
   └─ /core:retro ─► específico → contexto del proyecto
                 └─► generalizable → issue en QudeCode/ai-bank con la etiqueta `propuesta`
banco ─ /core:promocionar ─► cambio + eval de regresión ─► claude plugin eval + guardian ─► bump de versión ─► «cierra #N»
proyectos ─ autoUpdate ─► reciben la mejora
```

- **Específico**: lo mejoran los propios agentes al trabajar, con tu aprobación, y `/core:retro` al cerrar.
- **Común**: solo cambia en este repo. `/core:promocionar` acepta propuestas vistas en ≥2 proyectos o que documentan un fallo real, las convierte en evals para que no vuelvan a fallar, sube la versión y cierra el issue.
- **Auditoría**: `/meta:auditar-proyecto` detecta contexto desactualizado, duplicado o falso frente al código.

Preparación del repo del banco (una vez): `gh label create propuesta --repo QudeCode/ai-bank --description "Propuesta de mejora desde un proyecto"`.

## Desarrollar el banco

```bash
claude plugin validate .                         # marketplace
claude plugin validate plugins/<plugin>          # cada plugin
claude --plugin-dir plugins/core --plugin-dir plugins/dev --plugin-dir plugins/meta   # probar sin instalar
claude plugin eval plugins/<plugin> --runs 1 --scaffold --allow-tools Write Edit   # evals (consumen tokens)
```

Las reglas para escribir agentes, skills, workflows y evals están en [`docs/conventions.md`](docs/conventions.md). Cómo se llegó a este diseño: [`docs/analysis.md`](docs/analysis.md) y [`docs/comparativa.md`](docs/comparativa.md).

## Estructura

```
.claude-plugin/marketplace.json
plugins/<plugin>/.claude-plugin/plugin.json  agents/  skills/  workflows/  templates/  evals/
templates/project/        CLAUDE.md, .claude/settings.json, .claude/context/<agente>.md
docs/                     analysis.md, comparativa.md, conventions.md
.github/ISSUE_TEMPLATE/   propuesta.md
```

`myagents/` es material en bruto local (ignorado por git; contiene datos que no deben publicarse).

## Créditos

`dev:diseno-codigo` y `dev:modelo-dominio` son síntesis propias inspiradas en:
- *A Philosophy of Software Design* (J. Ousterhout), *Refactoring* (M. Fowler), *Clean Code* (R. C. Martin) y *Working Effectively with Legacy Code* (M. Feathers);
- las skills `clean-code`, `refactoring-patterns` y `software-design-philosophy` de wondelai (MIT);
- las skills públicas `codebase-design`, `domain-modeling` e `improve-codebase-architecture` (vocabulario de módulos profundos, glosario y ADR).

No se copia su texto.

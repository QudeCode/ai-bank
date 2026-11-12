# Análisis de `myagents/` — Fase 1

Fecha: 2026-11-12 · Estado: **pendiente de aprobación**

## 0. Formato vigente verificado

Revisado en la documentación oficial (code.claude.com/docs: *plugins-reference*, *plugin-marketplaces*, *plugins/components*, *host-marketplace*, *plugins/org*, *skills*) y con `claude` 2.1.300 instalado localmente.

| Pieza | Formato vigente | Implicación para el banco |
|---|---|---|
| `.claude-plugin/marketplace.json` | Obligatorios: `name`, `owner` (`{name}`), `plugins[]`. Cada entrada: `name`, `source` (ruta relativa desde la raíz del marketplace, empezando por `./`, sin `..`), `description` opcional. | Una entrada por plugin con `"source": "./plugins/<p>"`. |
| `plugin.json` | Opcional; solo `name` obligatorio (kebab-case). `version`, `description`, `author`, `license`, `keywords`… Un `version` **fija** a los usuarios en esa versión hasta que cambie. | `version` **solo** en `plugin.json` (si está en los dos sitios manda `plugin.json` y `validate` avisa del desajuste). |
| Nombres reservados | Error si empieza por `claude-`, `anthropic-`, `cc-plugin-`… | `core`, `ai-bank` son válidos. |
| Componentes | En la raíz del plugin: `agents/`, `skills/<n>/SKILL.md`, `commands/`, `hooks/hooks.json`, `.mcp.json`. Un `CLAUDE.md` en la raíz del plugin **no se carga**. | Instrucciones comunes → skills, no CLAUDE.md. |
| Comandos | `commands/` es **formato antiguo**; la doc recomienda skills para todo lo nuevo (se invocan igual: `/<plugin>:<skill>`). | Propongo `init-context` y `retro` como **skills** con `disable-model-invocation: true` (ver duda D5). |
| Agentes de plugin | Frontmatter admitido: `name`, `description`, `model`, `effort`, `maxTurns`, `tools`, `disallowedTools`, `skills`, `memory`, `background`, `isolation`, `color`… **Ignorados**: `permissionMode`, `hooks`, `mcpServers`, `initialPrompt`. Nombre resultante: `<plugin>:<name>` (p. ej. `core:revisor-codigo`). | Los límites de escritura de los agentes de solo lectura se hacen con `tools` mínimas + instrucción explícita (no hay `permissionMode`). |
| SKILL.md | `name`, `description` (+`when_to_use`; ≤1.536 caracteres juntos), `disable-model-invocation`, `user-invocable`, `allowed-tools`, `argument-hint`, `context: fork`, `paths`, `license`, `metadata`… Cuerpo < 500 líneas; detalle en ficheros de apoyo. | Skills cortas, referencias aparte. |
| Proyecto → marketplace | `.claude/settings.json` con `extraKnownMarketplaces.<nombre>.source = {"source":"github","repo":"QudeCode/ai-bank"}` y `enabledPlugins: {"core@ai-bank": true}`. Se aplica tras aceptar la confianza de la carpeta; **cada persona** debe instalar una vez (`claude plugin install core@ai-bank --scope project`). | Va en `templates/project/.claude/settings.json` y en el README. |
| Validación / carga local | `claude plugin validate <dir>` (marketplace y plugin) y `claude --plugin-dir <dir>`; `claude plugin details <p>` muestra el inventario. | Fase 3. |

## 1. Inventario

No hay ningún `CLAUDE.md`. Llamo a los proyectos por su carpeta.

### P1 · `.claude1/` — sistema de entrenamiento personal (repo plantilla, Python + CSV/TOML, español)

| Tipo | Pieza | Qué hace |
|---|---|---|
| Agente | `arquitecto-agentes` (opus) | Meta: estudia el workflow del repo y propone qué agentes tener. Solo propone. |
| Agente | `guardian-sistema` (opus) | Tras cambiar el «motor» revisa capas, fuente única, esquemas, referencias cruzadas, datos personales en el motor, escalabilidad. Solo lee. Veredicto «Listo para commit». |
| Agente | `revisor-plan` (sonnet) | Segunda mirada a un plan en borrador contra las reglas del usuario y de las skills. |
| Agente | `investigador-evidencia` (opus) | Busca evidencia posterior a la última revisión de una skill y propone cambios citados + `evidencia.md`. |
| Agente | `documentalista` (opus) | Patrón «LLM Wiki»: fuentes en bruto → fichas → páginas con citas; modos extracción (paralelo)/compilación/revisión. |
| Agente | `entrenador` (opus) | Único que decide y escribe datos del dominio. |
| Agente | `especialista` (opus) | Uno por disciplina, en paralelo; lee mucho, devuelve ≤15 líneas: hechos, propuestas, para revisar. |
| Agente | `importador` (sonnet) | Trae datos de conectores al scratchpad y ejecuta importadores. |
| Agente | `publicador` (sonnet) | Publica página y calendario. |
| Agente | `ux-pagina` (opus) | Revisión UX + WCAG 2.2 AA de la página generada. |
| Skill | `sistema` (58 KB) | Capas (motor/config/estado/registro…), «Principio de plantilla», «Una sola fuente por dato», «Quién hace qué», «Consumo», flujos, git. |
| Skill | `wiki` | Método LLM Wiki (registro, estados, citas, extraer/compilar/revisar). |
| Skills | `entrenador`, `calistenia`, `gimnasio`, `running`, `yoga`, `movilidad`, `nutricion` | Dominio deportivo, con `references/evidencia.md` y `calculos.toml`. |
| Hook | `settings.json` → `SessionStart` | `pip install -r requirements.txt`. |

### P2 · `.claude2/` — solo skills instaladas de terceros (sin agentes; proyecto no identificable)

| Pieza | Origen | Nota |
|---|---|---|
| `clean-code`, `refactoring-patterns`, `software-design-philosophy` (+ `references/`, ~200 KB) | wondelai, **MIT** (en frontmatter) | Contienen enlaces de afiliado de Amazon (`tag=wondelai00-20`). Inglés. |
| `codebase-design` (deep modules, seams, design-it-twice), `domain-modeling` (GLOSSARY.md + ADR), `improve-codebase-architecture` | Terceros sin cabecera de licencia (estilo/vocabulario de la colección pública de skills de M. Pocock; **no verificado**) | Traen `agents/openai.yaml` (Codex). `improve-codebase-architecture` depende de una skill `grilling` **que no está**. |
| `.agents/skills/find-skills` | vercel-labs (ecosistema `npx skills`) | Idéntica en P2 y P3. No es formato de plugin de Claude Code. |

### P3 · `.claude3/` — portal interno de una empresa (nombre omitido) (monolito modular NestJS + TypeORM + PostgreSQL, React 18 + Vite, CSS a mano)

| Tipo | Pieza | Qué hace |
|---|---|---|
| Agente | `backend-dev` (sonnet) | Implementa desde un *brief* autocontenido; reutilizar primero; no commit/no `npm install`; verifica en sandbox; informe con lista **Reuse**. |
| Agente | `frontend-dev` (sonnet) | Igual para frontend; comprobación Playwright con API simulada. |
| Agente | `plan-reviewer` (opus) | Revisor «goldfish» de contexto limpio (modelo elefante-pez): roles *explain-back*, *adversarial*, *reuse*, *concreteness*. |
| Agente | `reviewer` (opus) | Corrección, seguridad/permisos, integridad de migraciones, contrato back/front. |
| Agente | `quality-reviewer` (opus) | Duplicación, reutilización perdida, patrones inconsistentes, nombres mal usados, *AI slop*. «fix now / defer». |
| Agente | `verifier` (sonnet) | tsc, eslint, tests, build, Playwright; separa fallos preexistentes de nuevos. No arregla. |
| Skill | `architecture` | Decisiones del proyecto (módulos, guards, enums `as const`, FK reales, Swagger fuera de prod…). |
| Skill | `frontend-styling` | CSS plano por capas, sin inline/Tailwind, componentes CSS reutilizables. |
| Skill | `database-seeding` | Orden de FK, idempotencia (upsert vs delete-insert), propiedad de columnas desnormalizadas. |
| Settings | `settings.local.json` | 80+ permisos acumulados de sesiones. **Contiene secretos** (ver §4). |
| Datos | `vehicles.json` | **Datos de cliente** (ver §4). No es configuración. |

## 2. Cómo trabajas (patrones detectados)

**Reparto de roles (se repite en P1 y P3):**
- La **sesión principal orquesta**: habla contigo, escribe *briefs* autocontenidos, lanza agentes (en paralelo si son independientes), les pasa íntegro lo que devolvieron otros, junta las preguntas en un solo mensaje y se ocupa de git.
- **Un solo agente escribe** cada tipo de cosa; los demás **solo leen y proponen** («Solo propones», «You review; you never edit files»).
- **Revisión en dos ejes y con contexto limpio**: plan antes de implementar (P1 `revisor-plan`, P3 `plan-reviewer`); código después, con correctitud y calidad en paralelo (P3); estructura del sistema (P1 `guardian-sistema`).
- **Verificación separada de implementación** (P3 `verifier`; P1 `validar.py` en cada cierre).
- **Meta-trabajo** sobre el propio sistema de agentes (P1 `arquitecto-agentes`, `investigador-evidencia`).

**Convenciones de escritura de agentes:**
- Frontmatter con `model` **siempre fijado** (opus para decidir/analizar/revisar, sonnet para lo mecánico; P1 lo prohíbe explícitamente: «nunca `inherit`») y herramientas mínimas.
- `description` larga que dice cuándo usarlo **y qué no hace**.
- Cuerpo: rol en 1-2 frases → **Límites** → **Pasos/Modos** → **Entrega** (formato fijo, corto, por gravedad, con `archivo:línea` y arreglo concreto; decir explícitamente si no hay hallazgos).
- «El criterio vive en las skills»: el agente carga la skill, no copia el método. **Una sola fuente por dato.**
- «Antes de afirmar que algo falta, compruébalo.» «Reutiliza antes de crear (grep primero).» «Si es ambiguo, la opción conservadora y lo reportas.» «No inventes.»
- Ahorro de contexto: leer solo lo necesario (`head`, `grep`), no ficheros enteros.

**Separación común/específico:** P1 ya lo formaliza («Principio de plantilla»: motor vs. datos del usuario; el motor no contiene nada personal; `guardian-sistema` lo vigila). Es exactamente el diseño que pides para el banco, así que lo reutilizo como principio de `core`.

**Stack:** NestJS + TypeORM + PostgreSQL y React + Vite (P3); Python con CSV/TOML (P1, solo como scripts del dominio). **No hay material de Prisma ni de AWS.**

**Idioma:** P1 en español; P3 agentes en inglés y skills en español. Mensajes de commit: P1 en el idioma del usuario.

## 3. Contradicciones entre versiones y elección

| Tema | Versiones | Elección y motivo |
|---|---|---|
| Revisión de plan | P1: contra reglas del usuario/dominio. P3: «goldfish» de contexto limpio con 4 roles. | **P3** como base (genérico, roles explícitos y verificables) + veredicto final de P1 («Plan listo» / N bloqueantes). |
| Escala de gravedad | P1: Bloquea / Conviene / Sugerencia. P3: ranking + «fix now / defer». | **Unificar**: Bloquea / Conviene / Sugerencia, y cada hallazgo marcado *ahora* o *diferir*. |
| Commits | P1: la sesión principal hace commit y push al acabar cada tarea. P3: nunca sin aprobación del usuario. | **Los subagentes nunca hacen commit** (ambos coinciden). La política de la sesión principal es específica de proyecto → `CLAUDE.md` de la plantilla, con P3 por defecto (pedir aprobación), que es la más segura. |
| Rutas de reglas | P3: rutas absolutas (`/workspaces/…/CLAUDE.md`). P1: relativas. | **Relativas** + `.claude/context/<agente>.md`. |
| Carga de skills | P1: `skills:` en frontmatter. P3: «Load the X skill» con la herramienta Skill. | `skills:` para lo que el agente necesita siempre; herramienta Skill para lo condicional (skills de stack). Comprobaré en Fase 2 cómo se referencian skills con espacio de nombres (`core:…`). |
| Idioma | P1 español, P3 inglés. | **Español** (lo pides). Informes en el idioma del proyecto si su contexto lo dice. |
| Restricción de herramientas | P1 usa `disallowedTools` cuando el agente necesita conectores; P3 `tools`. | `tools` mínimas por defecto; `disallowedTools` solo si el agente debe heredar MCP del proyecto. |
| Revisores de código | P3 tiene dos (`reviewer` y `quality-reviewer`) explícitamente complementarios. | Ver duda **D4**: propongo **un** agente `revisor-codigo` con dos modos (`correccion`, `calidad`) lanzado dos veces en paralelo. |

## 4. Secretos, datos de cliente y rutas internas — **excluidos siempre**

| Dónde | Qué | Acción |
|---|---|---|
| `.claude3/settings.local.json` | Contraseña de PostgreSQL en claro (`PGPASSWORD=…`, `ALTER USER … PASSWORD …`, `DATABASE_URL=postgres://postgres:…@…`), nombres de bases de datos, rutas internas (`/workspaces/test_apptestportal/…`, `/home/node/…`), lecturas de sudoers, un mensaje de commit. | **Descartado entero.** |
| `.claude3/vehicles.json` | Datos de cliente: flota de vehículos con marca/modelo, VIN, códigos de departamento internos, plazas y IDs internos. | **Descartado entero.** |
| `.claude3/agents/*`, `skills/*` | Nombre del proyecto, rutas absolutas del workspace y del sandbox, descripción del portal interno, ficheros de *bypass* de auth en dev. | Se extrae solo el método; nada de esto pasa al banco. Sirve para diseñar las secciones de las plantillas de contexto. |
| `.claude2/skills/*` (wondelai) | Enlaces de afiliado de Amazon. | No se copian. |
| `.DS_Store` | Basura de macOS. | Ignorados. |

`myagents/` contiene secretos: **no debe subirse al repo**. Lo añado a `.gitignore` (no lo modifico, solo evito que git lo rastree).

## 5. Mapa origen → destino

Leyenda: **P** = se promociona (generalizado), **F** = se fusiona con, **C** = solo inspira una plantilla de contexto, **D** = se descarta.

| Origen | Destino | Decisión y motivo |
|---|---|---|
| P3 `plan-reviewer` + P1 `revisor-plan` | `core:revisor-plan` | **F/P.** Base P3 (4 roles); de P1, veredicto y comprobación contra reglas declaradas. Reglas del proyecto → contexto. |
| P3 `reviewer` + P3 `quality-reviewer` | `core:revisor-codigo` | **F/P.** Dos modos. Lo específico del proyecto (rama base, ficheros excluidos, nombres de clases propias) → contexto. |
| P3 `verifier` | `core:verificador` | **P.** Comandos, sandbox y rama base → contexto. Se conserva «separar fallos preexistentes de nuevos». |
| P3 `backend-dev` + `frontend-dev` | `core:implementador` | **F/P.** Genérico desde un *brief*; el ámbito (back/front/app) lo da el brief y el contexto; carga la skill de stack que toque. Se puede lanzar dos veces en paralelo. |
| P1 `guardian-sistema` | `core:guardian` | **P.** Revisor de coherencia estructural (capas, fuente única, referencias cruzadas, nada específico en lo común). Sirve para proyectos y para **este banco**. |
| P1 `arquitecto-agentes` | `core:arquitecto-agentes` | **P.** Meta-agente: propone reparto de agentes de un repo usando el banco. |
| P1 `investigador-evidencia` | `core:investigador` | **P.** Generalizado: revisa la evidencia/documentación vigente detrás de una skill o decisión y propone cambios citados. |
| P1 `especialista` | — | **D** como agente (dominio). Su patrón «leer mucho, devolver poco, no decidir» va a la skill `orquestacion`. |
| P1 `entrenador`, `importador`, `publicador` | — | **D** (dominio). Patrón «un solo escritor» → `orquestacion`. |
| P1 `documentalista` + skill `wiki` | — (candidato) | **D por ahora**: genérico en idea, pero acoplado a scripts del proyecto (`fuentes.py`, `validar.py`). Ver **D6**. |
| P1 `ux-pagina` | — (candidato) | **D por ahora**: atado a `pagina.py`. Ver **D6**. |
| P1 `sistema` (capas, principio de plantilla, fuente única, quién hace qué, consumo) | `core:orquestacion` + `docs/conventions.md` | **P** de los principios; los flujos del dominio se quedan. |
| P1 skills de deporte, `calculos.toml`, `esquemas.toml`, plantillas | — | **D** (dominio). La plantilla `evidencia.md` inspira el formato de salida de `investigador`. |
| P1 hook `SessionStart` pip install | — | **D**: específico de un proyecto Python; cabe en su `.claude/settings.json`. |
| P2 `codebase-design` + `software-design-philosophy` + `clean-code` + `refactoring-patterns` | `core:diseno-codigo` | **F/P** como síntesis propia y corta en español (módulos profundos, seams, test de borrado, diseñar dos veces, smells → refactor en pasos pequeños con tests). Ver **D1** sobre copiar los originales. |
| P2 `domain-modeling` | `core:modelo-dominio` | **P** (síntesis): `GLOSSARY.md` + ADR en `docs/adr/` con el criterio «difícil de revertir, sorprendente, compromiso real». |
| P2 `improve-codebase-architecture` | `core:mejorar-arquitectura` | **P** (síntesis), invocación manual. Sin la dependencia rota `grilling` (la conversación de decisión va dentro) e informe en Markdown en lugar de HTML con CDN. |
| P2/P3 `find-skills` | — | **D**: ecosistema `npx skills`, no plugins de Claude Code (aquí se usa `/plugin`). |
| P2 `agents/openai.yaml` | — | **D**: metadatos de Codex. |
| P3 `architecture` | `stack-nestjs:nestjs-backend` + **C** | **P** de lo de stack (estructura de módulo controller/service/repository, orden de guards JWT→Roles, `ValidationPipe` whitelist+transform, enums `as const`, Swagger fuera de producción, sin floating promises). Las decisiones del proyecto → plantilla de contexto. |
| P3 `database-seeding` | `stack-nestjs:typeorm-datos` | **P** de lo genérico (migraciones reversibles y que no se editan, seeder idempotente en orden de FK, upsert vs delete-insert, un único dueño por columna desnormalizada, validar referencias huérfanas). |
| P3 `frontend-styling` | `stack-react:react-frontend` + **C** | **P** de lo genérico (CSS por capas base/layout/components/pages, nada de estilos inline estáticos, reutilizar el control existente, mismo control = mismo aspecto, color de estado solo en el elemento, Playwright con API simulada). «Sin Tailwind», tokens y clases concretas → contexto. |
| P3 `settings.local.json`, `vehicles.json` | — | **D** (secretos/datos de cliente). |

## 6. Propuesta de plugins

| Plugin | Contenido | Justificación |
|---|---|---|
| `core` | Agentes de rol, skills de método y flujo (`init-context`, `retro`). | Obligatorio; todo es agnóstico de stack. |
| `stack-nestjs` | Skills `nestjs-backend` y `typeorm-datos`. | Hay material real (P3), aunque de **un solo proyecto**. |
| `stack-react` | Skill `react-frontend`. | Ídem. |

No hay plugin de Prisma, AWS ni Python: no hay material. Los plugins de stack **no** tienen agentes propios: `core:implementador` y los revisores cargan la skill de stack que diga el contexto del proyecto (así no se duplican roles). Ver **D3**.

## 7. Componentes propuestos

### `core` — agentes (7)

| Agente | Modelo | Herramientas | Descripción |
|---|---|---|---|
| `revisor-plan` | opus | Read, Grep, Glob, Bash | Revisa un plan antes de implementar, con contexto limpio, en el rol que pida el brief (explicar, adversario, reutilización, concreción). No edita. |
| `implementador` | sonnet | Read, Grep, Glob, Edit, Write, Bash, Skill | Implementa un cambio acotado desde un brief autocontenido; reutiliza antes de crear; verifica y entrega con lista de reutilización. Sin commits ni instalaciones. |
| `verificador` | sonnet | Read, Grep, Glob, Bash | Ejecuta las comprobaciones del proyecto (tipos, lint, tests, build, e2e) e informa pasa/falla separando fallos preexistentes. No arregla. |
| `revisor-codigo` | opus | Read, Grep, Glob, Bash, Skill | Revisa un diff. Modo `correccion`: bugs, seguridad, permisos, migraciones, contrato. Modo `calidad`: duplicación, reutilización perdida, inconsistencias, AI slop. No edita. |
| `guardian` | opus | Read, Grep, Glob, Bash | Tras un cambio estructural (agentes, skills, config, capas, docs) comprueba coherencia: fuente única, referencias cruzadas, nada específico en lo común. Veredicto. No edita. |
| `arquitecto-agentes` | opus | Read, Grep, Glob, Bash, WebSearch, WebFetch | Estudia el workflow de un repo y propone qué agentes y skills del banco usar o crear. Solo propone. |
| `investigador` | opus | Read, Grep, Glob, WebSearch, WebFetch, Skill | Revisa la evidencia o documentación vigente que sostiene una skill o decisión y propone cambios citados con nivel de confianza. Solo propone. |

Todos con las secciones: rol, método, principios, formato de salida, **Contexto del proyecto** (leer `.claude/context/<name>.md`; si no existe, proponer crearlo desde la plantilla) y **Aprendizaje** (proponer, nunca escribir sin preguntar).

### `core` — skills (7)

| Skill | Invocación | Descripción |
|---|---|---|
| `orquestacion` | modelo | Cómo la sesión principal reparte trabajo: briefs autocontenidos, un solo escritor, paralelo cuando es independiente, pasar resultados íntegros, preguntas juntas, flujo plan → revisión de plan → implementar → verificar → revisión de código en paralelo → aprobación. |
| `diseno-codigo` | modelo | Vocabulario y criterios de diseño: módulos profundos, interfaz, seam, adaptador, test de borrado, diseñar dos veces, smells → refactors seguros en pasos pequeños. |
| `modelo-dominio` | modelo | Mantener `GLOSSARY.md` y ADRs (cuándo ofrecer uno y formato mínimo). |
| `mejorar-arquitectura` | manual (`/core:mejorar-arquitectura`) | Busca oportunidades de profundizar módulos en las zonas calientes del repo y las presenta para decidir una. |
| `init-context` | manual (`/core:init-context`) | Crea `.claude/context/` en un proyecto existente: analiza el código y rellena las plantillas de cada agente común, mostrando el borrador antes de escribir. |
| `retro` | manual (`/core:retro`) | Al cerrar sesión/feature: (a) cambios propuestos a `context/<rol>.md`; (b) aprendizajes generalizables como candidatos al banco, con el diff exacto sugerido y el bump de versión. |
| `promocionar` *(opcional, ver D7)* | manual | En el repo del banco: aplica candidatos de una retro, pasa `guardian` y sube versión. |

### `stack-nestjs` — skills (2)
- `nestjs-backend`: estructura de módulo, seguridad con guards, validación de DTO, enums `as const`, documentación de API, linting.
- `typeorm-datos`: migraciones, seeders idempotentes, integridad referencial, columnas desnormalizadas.

### `stack-react` — skills (1)
- `react-frontend`: organización del CSS, reglas de estilos, reutilizar componentes y controles, comprobación visual con Playwright.

### Comandos
Ninguno en `commands/`: la doc vigente lo da por formato antiguo y las skills manuales se invocan igual (`/core:retro`). Ver **D5**.

### Plantillas
`templates/project/`: `CLAUDE.md` (reglas duras del proyecto, política de commits, idioma), `.claude/settings.json` (marketplace + plugins), `.claude/context/<agente>.md` × 7, con secciones vacías y guía. Ejemplo para `verificador`: *Comandos por app*, *Dónde se ejecuta (sandbox, sincronización)*, *Rama base*, *Comprobaciones e2e*, *Fallos conocidos preexistentes*.

## 8. Dudas que necesito que resuelvas

**D1. Skills de terceros de P2.** ¿Qué hago con ellas?
- (a) **Recomendado:** síntesis propia, corta y en español (`diseno-codigo`, `modelo-dominio`, `mejorar-arquitectura`), citando los originales en el README. Más ligera (los originales suman ~200 KB) y sin problemas de licencia.
- (b) Copiar las MIT (wondelai) con su licencia y atribución, sin los enlaces de afiliado, como plugin aparte `terceros`. Las otras tres no tienen licencia visible, así que no las copiaría.
- (c) No incluirlas e instalarlas desde su origen.

**D2. Nombres.** Marketplace `ai-bank` (repo `QudeCode/ai-bank`), plugins `core`, `stack-nestjs`, `stack-react`, owner «QudeCode». ¿Te valen?

**D3. Plugins de stack.** Solo hay material de **un** proyecto (P3). ¿(a) **Recomendado:** los dos plugins pequeños propuestos; (b) uno solo `stack-ts-web`; (c) ninguno todavía (lo de P3 se queda solo como plantilla de contexto)?

**D4. Revisores de código.** ¿(a) **Recomendado:** un único `revisor-codigo` con modos `correccion`/`calidad`, lanzado dos veces en paralelo; (b) mantener dos agentes separados como en P3?

**D5. `commands/`.** Pediste `plugins/core/commands/`, pero la doc vigente recomienda skills para lo nuevo. ¿Hago `init-context` y `retro` como skills de invocación manual (recomendado) y omito `commands/`?

**D6. `documentalista` + `wiki` y `ux-pagina` (P1).** ¿Los descarto por ahora (recomendado, dependen de scripts de P1) o quieres un plugin `conocimiento` con el método LLM Wiki generalizado?

**D7. Promoción.** ¿Añado una skill `promocionar` para aplicar en el banco los candidatos de una retro, o basta con que `retro` dé el diff exacto y lo apliques tú?

**D8. Origen de P2.** ¿Recuerdas de qué proyecto venía? Solo para documentarlo; no cambia nada.

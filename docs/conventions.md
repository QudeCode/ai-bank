# Convenciones del banco

Cómo se escribe cada pieza de `ai-bank`. `meta:guardian` revisa contra este documento.

## Principio: común frente a específico

- **Común (el banco):** roles, métodos, principios, formatos de salida, workflows y conocimiento de stack que sirven en más de un proyecto.
- **Específico (cada proyecto):** nombres de módulos, rutas, decisiones, dominio de negocio, comandos. Vive en el `CLAUDE.md` del proyecto, en `.claude/context/<agente>.md` y en las skills del proyecto.
- Ningún fichero del banco contiene datos de un proyecto, clientes, URLs internas ni secretos. Los ejemplos son inventados y neutros.
- Los agentes del banco no se copian ni se editan en los proyectos: se afinan aquí, por el ciclo `retro` → issue → `promocionar`.

## Plugins por tipo

| Plugin | Tipo | Contiene |
|---|---|---|
| `core` | Base y gestión | Skills de orquestación y del ciclo de mejora. Plantilla de proyecto (enlace) |
| `dev` | Desarrollo | Agentes de plan, implementación, verificación y revisión; skills de diseño; workflows de revisión |
| `meta` | Meta | Agentes sobre el propio sistema de agentes |
| `stack-*` | Conocimiento de stack | Solo skills. Las cargan los agentes de `dev` según el contexto del proyecto |

Los agentes de dominio de un proyecto («utilidades») se quedan en ese proyecto. Un plugin `dominio-*` solo tiene sentido si el dominio se usa en ≥2 repos.

## Agentes (`plugins/<p>/agents/<nombre>.md`)

Frontmatter:
- `name`: igual al nombre del fichero, en kebab-case y en español.
- `description`: un disparador. Dice cuándo usarlo, cuándo **no** y en qué se diferencia de su vecino más parecido.
- `tools`: las mínimas. Los que solo revisan o proponen: `Read, Grep, Glob` (+ `Skill`, `WebSearch`, `WebFetch` si les hace falta). **Sin Bash ni escritura**: el solo lectura se impone con herramientas, porque los agentes de plugin ignoran `permissionMode` y `hooks`.
- `model`: siempre fijado, nunca `inherit`. `opus` para decidir, planificar y revisar; `sonnet` para lo mecánico; `haiku` para recolectar datos simples.
- `skills`: solo las que necesita siempre, con prefijo (`dev:diseno-codigo`). Las condicionales se cargan con la herramienta Skill.

Cuerpo, en este orden:
1. **Rol** en 1-2 frases.
2. **Contexto del proyecto**: lee `.claude/context/<name>.md`; qué espera encontrar ahí; si no existe, sigue con los valores por defecto y lo dice en la entrega.
3. **Límites**: qué no hace nunca.
4. **Entrada** (si espera ficheros del encargo), y **Método** o **Modos/Roles**.
5. **Principios** (si aportan).
6. **Entrega**: formato fijo, corto, por gravedad (Bloquea / Conviene / Sugerencia) con `archivo:línea` y el arreglo concreto, y una línea final de veredicto. Si no hay nada significativo, lo dice.
7. **Aprendizaje**: propone «Propuestas para el contexto» con la sección y el texto exacto. Nunca escribe el contexto. Marca «(generalizable)» lo que valdría en otro proyecto.

El criterio vive en las skills: un agente carga la skill, no copia su método. Un agente nuevo solo si aporta ojos limpios, paralelismo, aislar un contexto caro o menos herramientas.

## Skills (`plugins/<p>/skills/<nombre>/SKILL.md`)

- `description`: un disparador. Qué hace, cuándo usarla y, si hay riesgo de confusión, cuándo no.
- Las que tienen efectos o son flujos que lanza el usuario llevan `disable-model-invocation: true` (`init-context`, `retro`, `promocionar`).
- No digas lo obvio: solo lo que saca a Claude de su comportamiento por defecto.
- Menos de 500 líneas. El detalle va en `references/` y se enlaza desde el SKILL.
- Termina con **Gotchas**: la sección de más valor, que crece con fallos reales.
- Para rutas dentro del plugin usa `${CLAUDE_PLUGIN_ROOT}`.

## Workflows (`plugins/<p>/workflows/<nombre>.js`)

- `meta` como literal puro (`name`, `description`, `whenToUse`, `phases`).
- Solo tramos automáticos: un workflow no puede preguntar a mitad. Las aprobaciones se quedan en la sesión.
- Usan los agentes del banco con `agentType: '<plugin>:<agente>'`. Así su método vive en un solo sitio.
- Entrada por `args`, con un preparador si falta. No callan lo que dejan fuera: lo dicen con `log()`.

## Evals (`plugins/<p>/evals/<caso>/`)

- Cada mejora promocionada deja un caso de regresión creado a partir del caso real anonimizado.
- `prompt.md` (frontmatter con `max_turns` y `allowed_tools`) y `graders/`, con al menos un grader barato (`regex`, `tool_used`, `file_exists`) más un `llm` con PASS y FAIL concretos si hace falta juicio.
- Los ficheros de partida, con `case.yaml` + `fixture.sh` (se ejecuta con `--scaffold`).
- `claude plugin eval plugins/<p> --runs 1 --scaffold --allow-tools Write Edit` antes de subir la versión (las herramientas de escritura solo si algún caso las necesita).

## Plantillas (`templates/project/`)

- Es la fuente única de las plantillas. `plugins/core/templates/project` es un enlace simbólico para que `init-context` las encuentre una vez instalado.
- Las secciones van vacías, con un comentario breve de qué poner, y terminan con **Gotchas**.
- `CLAUDE.md` del proyecto: corto (<200 líneas). Lleva los comandos, las reglas duras, las reglas sin excepción (candidatas a hook), git e idioma.

## Memoria del proyecto

Los agentes y skills del banco no inventan sitios para documentar: usan las capas de `core:memoria` (decisiones, hallazgos, notas de trabajo, glosario, planes) en la carpeta de documentación que declare el proyecto. Toda pieza que tome decisiones las contrasta con las vigentes, y toda pieza que descubra algo verificado lo propone como hallazgo.

Las reglas del proyecto mandan sobre el método de los agentes: cada agente lo dice en su sección de contexto.

## Imposición

Una instrucción es una orientación. Lo que no admite excepción va a:
- un hook;
- `permissions.deny`;
- un validador.

Los plugins del banco no traen hooks globales, porque se ejecutarían en todos los proyectos. Los hooks se proponen en el `.claude/settings.json` de cada proyecto, vía `retro`.

## Versionado

- `version` solo en `plugins/<p>/.claude-plugin/plugin.json`, nunca en `marketplace.json`.
- **patch** para aclaraciones, **minor** para comportamiento o componentes nuevos, **major** para renombrar o quitar (con `renames` en `marketplace.json`).
- Sin subir la versión, los proyectos no reciben el cambio.

## Idioma

Instrucciones en español, concisas y directas. Nombres de componentes en español y kebab-case, sin tildes.

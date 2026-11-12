---
name: promocionar
description: En el repositorio del banco ai-bank, revisa los issues con la etiqueta propuesta que abre /core:retro desde los proyectos, aplica los aceptados a los agentes y skills comunes, los convierte en evals de regresión, valida y sube la versión del plugin. Úsala solo dentro del repo del banco.
disable-model-invocation: true
argument-hint: "[número de issue ...]"
---

# Promocionar mejoras al banco

## 0. Comprobaciones

- Estás en el repo del banco: existe `.claude-plugin/marketplace.json` con `"name": "ai-bank"`. Si no, para.
- `gh auth status` funciona. Si no, pide al usuario que haga `! gh auth login`.

## 1. Recoge

```bash
gh issue list --repo QudeCode/ai-bank --label propuesta --state open --json number,title,body,comments
```

O solo los números de `$ARGUMENTS`.

## 2. Decide cada propuesta

Se acepta si cumple **todo**:

1. **Tracción**: se vio en ≥2 proyectos (comentarios «visto también…» o issues duplicados) **o** documenta un fallo real de un agente o skill común.
2. **Es común**: método, rol, formato o fallo del componente; sin nada específico de un proyecto (aplica los criterios de `meta:guardian`).
3. **No duplica**: el banco no lo dice ya en otro sitio. Si lo dice, se mejora ese sitio.
4. **Cabe**: la skill sigue con menos de 500 líneas y el agente sigue teniendo un solo rol.

Enseña una tabla con aceptar, rechazar o esperar y el motivo, y pide confirmación.

## 3. Aplica cada aceptada

1. Edita el componente: texto mínimo, en su sección y sin repetir lo que dice otra skill.
2. **Eval de regresión.** Crea `plugins/<plugin>/evals/<slug>/` a partir del caso real anonimizado:
   - `prompt.md`: frontmatter con `max_turns` y `allowed_tools`; el cuerpo es el mensaje realista.
   - `graders/`: al menos un grader barato (`regex`, `tool_used`, `file_exists`) y, si hace falta juicio, uno `llm` con condiciones PASS y FAIL concretas.
3. Valida:

   ```bash
   claude plugin validate . && claude plugin validate plugins/<plugin>
   claude plugin eval plugins/<plugin> --runs 1
   ```

   Los evals gastan tokens: avisa del alcance antes de lanzarlos. Si un eval que antes pasaba falla, el cambio no entra.
4. Revisión: lanza `meta:guardian` con el diff en un fichero (ver `core:orquestacion`).
5. **Versión** en `plugins/<plugin>/.claude-plugin/plugin.json`, solo ahí:
   - **patch**: aclaraciones y correcciones de texto.
   - **minor**: comportamiento nuevo o componente nuevo.
   - **major**: renombrar o quitar. Añade también la entrada en `renames` de `marketplace.json`.
6. Commit: `<plugin>: <cambio> (cierra #N)`. Haz push solo si el usuario lo pide.

## 4. Cierra

- Aceptadas: se cierran con el commit.
- Rechazadas o en espera: propone un comentario con el motivo y publícalo solo con confirmación.
- Recuerda cómo llega a los proyectos: `/plugin marketplace update ai-bank`, o la actualización automática si está activa.

## Gotchas

- Subir la versión es lo que hace que los proyectos reciban el cambio. Sin subirla, nadie lo ve.
- No subas la versión en `marketplace.json`: manda la de `plugin.json` y `validate` avisa del desajuste.

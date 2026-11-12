# Comparativa: cómo trabajan los profesionales frente a este banco

Fecha: 2026-11-12. Contexto: antes de construir el banco se contrastó el diseño de `docs/analysis.md` con las prácticas publicadas por Anthropic y por equipos y proyectos de referencia en desarrollo con IA.

## Resumen

Tu forma de trabajar ya coincide con lo que hacen los profesionales:
- Una sesión principal que coordina.
- Un solo escritor por cosa.
- Revisores de contexto limpio y un verificador separado.
- El criterio en skills.
- Promoción de mejoras desde los proyectos al banco.

La diferencia principal es de **imposición**. En los proyectos de origen todo dependía de que el modelo obedeciera instrucciones. Los profesionales garantizan lo importante con herramientas mínimas, reglas de denegación y hooks, y trabajan contra un **plan escrito como contrato**. De ahí salen los ajustes A1–A9.

## Práctica observada frente a nuestra propuesta

| Práctica | Quién | Nuestra propuesta | Veredicto |
|---|---|---|---|
| «Un puñado de agentes bien acotados»: demasiados especialistas vuelven poco fiable la delegación automática | Anthropic | 9 agentes en 2 plugins (`dev`, `meta`), activables por proyecto | ✅ Coincide. wshobson/agents es el extremo opuesto (≈200 agentes), compensado con instalación por plugin, que también usamos |
| Procedimientos del equipo → skills. Subagentes para trabajo en paralelo, salida ruidosa, revisión con ojos limpios o menos herramientas. «Delegar no da mejor respuesta; un revisor nuevo sí» | Anthropic | El criterio vive en las skills; los agentes cargan skills | ✅ Coincide |
| Un solo hilo escribe; los subagentes, para leer y responder; compartir el contexto completo | Cognition | «Un solo escritor», pasar los resultados íntegros | ✅ Coincide. ⚠️ Delegar siempre la implementación va en contra → **A1** |
| No repartir trabajo secuencial dependiente ni ediciones del mismo fichero | Anthropic | Un proyecto delegaba siempre backend y frontend | ⚠️ **A1** |
| Especificación o plan escrito como contrato, con definición de hecho; construir en una sesión limpia; revisar contra el plan | Anthropic (`SPEC.md`), GitHub Spec Kit, obra/superpowers | plan → revisión del plan → implementar → verificar → revisar | ✅ Mismo flujo. ⚠️ Faltaba un formato de plan común → **A5** |
| Roles de gestión (analista, PM, scrum master) que asume la sesión principal; un orquestador | BMAD | Categoría de gestión → plugin `core` (`orquestacion`, `init-context`, `retro`, `promocionar`) | ✅ Coincide: un subagente no puede lanzar subagentes, así que coordinar es de la sesión principal |
| Solo lectura **impuesta** con `tools: Read, Grep, Glob`, no pedida en el prompt | Anthropic | Revisores con Bash y «solo lectura» por instrucción | ⚠️ **A2** |
| Lo que no admite excepción → hook, regla de denegación o ajuste gestionado; las instrucciones son orientaciones | Anthropic | Todo eran instrucciones | ⚠️ **A3** |
| «Un revisor al que se pide encontrar problemas siempre encuentra algo»: pedir solo lo que afecta a la corrección | Anthropic | «Sin nitpicks», «di si no hay nada» | ✅ Se refuerza → **A4** |
| CLAUDE.md corto (<200 líneas), solo lo que Claude no puede deducir del repo | Anthropic | CLAUDE.md + `.claude/context/<agente>.md` | ⚠️ Riesgo de duplicar → **A6** |
| Lo más valioso de una skill es su sección de **Gotchas**, que crece con fallos reales; la descripción es un disparador; no decir lo obvio | Anthropic | Skills con referencias; la retro alimenta el contexto | ✅ Se añade «Gotchas» → **A7** |
| Gobierno de skills: incubar, promocionar al marketplace cuando tienen tracción, medir el uso | Anthropic | proyecto → `retro` → `promocionar` → subir versión | ✅ Coincide. Se añade un criterio de tracción → **A8** |
| Orquestación repetible en scripts (workflows) para revisiones y auditorías | Claude Code (dynamic workflows) | No existía | ➕ **A9** |
| Evals de regresión antes de publicar cambios | Claude Code (`claude plugin eval`) | No existía | ➕ Ciclo de mejora |
| Modelo según la tarea, fijado | Anthropic, wshobson/agents | opus para juzgar, sonnet para lo mecánico, nunca `inherit` | ✅ Coincide |
| Skills obligatorias y TDD estricto | obra/superpowers | Método flexible | ➖ Diferencia deliberada: Anthropic recomienda no encorsetar |
| Equipos de agentes (agent teams) | Claude Code (experimental) | No se usan | ➖ Experimentales y caros |
| AGENTS.md como estándar entre herramientas | Linux Foundation (AAIF) | CLAUDE.md | ➖ Solo se usa Claude Code |

## Ajustes al diseño

- **A1 · Implementar en la sesión principal por defecto.** `dev:implementador` solo para unidades independientes con un plan cerrado (p. ej. backend y frontend con el contrato fijado) o para cambios mecánicos amplios.
- **A2 · Solo lectura impuesta.** Los revisores y los agentes meta no tienen Bash ni escritura. La sesión principal les pasa el diff o la salida de los validadores en un fichero. Solo `implementador` y `verificador` tienen Bash; `arquitecto` solo escribe el fichero del plan.
- **A3 · Reglas sin excepción → mecanismos deterministas.** La plantilla de proyecto deniega leer `.env*`. Cada contexto tiene la sección «Reglas sin excepción (candidatas a hook)». `retro` propone convertir en hook lo que se incumple más de una vez. Los plugins no traen hooks globales.
- **A4 · Revisores sobrios.** Revisan contra el plan y el contexto, solo lo que afecta a corrección, seguridad o coherencia. Si no hay nada significativo, lo dicen.
- **A5 · Plan como contrato.** Plantilla común (`plugins/dev/templates/plan.md`) con definición de hecho comprobable. La redacta `dev:arquitecto` y la revisa `dev:revisor-plan`.
- **A6 · Una sola fuente por dato en el proyecto.** `CLAUDE.md` guarda los comandos, las reglas duras y la política de commits. `context/<agente>.md` guarda solo lo de su rol. Las skills del proyecto guardan el conocimiento extenso.
- **A7 · Gotchas** al final de cada skill y de cada contexto.
- **A8 · Criterio de promoción.** Solo se promociona lo visto en ≥2 proyectos o un fallo real documentado.
- **A9 · Workflows predeterminados:** `/dev:revisar-plan`, `/dev:revisar-cambios`, `/dev:mejorar-arquitectura` y `/meta:auditar-proyecto`.

## Ciclo de mejora en dos capas

```
proyecto ── uso ──► el agente propone «Aprendizaje» ──► (apruebas) ──► .claude/context/<agente>.md   [específico]
    └── /core:retro ──► específico → contexto del proyecto
                    └─► generalizable → issue en el banco con la etiqueta `propuesta`
banco ── /core:promocionar ──► aplica el cambio + convierte el caso real en eval
                           ──► claude plugin eval + guardian ──► subir versión ──► «cierra #N»
proyectos ── actualizar el marketplace ──► reciben la mejora                                      [común]
```

## Fuentes

- Anthropic — Best practices for Claude Code: https://code.claude.com/docs/en/best-practices
- Anthropic — How and when to use subagents in Claude Code: https://claude.com/blog/how-and-when-to-use-subagents-in-claude-code
- Anthropic — Lessons from building Claude Code: How we use skills: https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/
- Claude Code — Agent teams: https://code.claude.com/docs/en/agent-teams
- Claude Code — Dynamic workflows: https://code.claude.com/docs/en/workflows.md
- Claude Code — Test plugins with evals: https://code.claude.com/docs/en/plugin-evals.md
- Cognition — Don't build multi-agents (2025-06-12): https://cognition.com/blog/dont-build-multi-agents
- LangChain — How and when to build multi-agent systems: https://blog.langchain.com/how-and-when-to-build-multi-agent-systems
- GitHub Spec Kit: https://learn.microsoft.com/en-us/training/modules/spec-driven-development-github-spec-kit-enterprise-developers/3-examine-github-spec-kit
- BMAD Method: https://www.mintlify.com/bmad-code-org/BMAD-METHOD/concepts/agents
- obra/superpowers: https://github.com/obra/superpowers
- wshobson/agents: https://github.com/wshobson/agents
- AGENTS.md: https://infoq.com/news/2025/08/agents-md/

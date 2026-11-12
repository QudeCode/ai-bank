export const meta = {
  name: 'auditar-proyecto',
  description: 'Audita el contexto específico del proyecto (CLAUDE.md y .claude/context/) frente al código y la estructura de agentes, y propone actualizaciones concretas',
  whenToUse: 'Periódicamente, tras cambios grandes en el proyecto o cuando los agentes fallan por contexto desactualizado. Sin args.',
  phases: [
    { title: 'Inventario', detail: 'ficheros de contexto y plugins activos' },
    { title: 'Contrastar', detail: 'cada contexto frente al código, más el guardián' },
    { title: 'Propuestas', detail: 'cambios concretos para aprobar' },
  ],
}

const INVENTARIO = {
  type: 'object',
  required: ['contextos', 'memoria', 'agentes_sin_contexto', 'claude_md'],
  properties: {
    contextos: { type: 'array', items: { type: 'string' }, description: 'Rutas de .claude/context/*.md' },
    memoria: { type: 'array', items: { type: 'string' }, description: 'Rutas de la memoria del proyecto: índice de decisiones, hallazgos.md, notas de trabajo abiertas, GLOSSARY.md' },
    agentes_sin_contexto: { type: 'array', items: { type: 'string' }, description: 'Agentes del banco de los plugins activos sin .claude/context/<agente>.md' },
    claude_md: { type: 'string', description: 'Ruta de CLAUDE.md o vacío si no existe' },
  },
}

const DERIVA = {
  type: 'object',
  required: ['fichero', 'problemas'],
  properties: {
    fichero: { type: 'string' },
    problemas: {
      type: 'array',
      items: {
        type: 'object',
        required: ['tipo', 'seccion', 'detalle', 'propuesta'],
        properties: {
          tipo: { type: 'string', enum: ['desactualizado', 'falso', 'duplicado', 'falta', 'sobra', 'secreto'] },
          seccion: { type: 'string' },
          detalle: { type: 'string', description: 'Qué dice frente a qué hay, con la evidencia (archivo:línea o comando)' },
          propuesta: { type: 'string', description: 'Texto exacto que se añade, cambia o quita' },
        },
      },
    },
  },
}

phase('Inventario')
const inv = await agent(
  `Haz inventario del contexto específico de este proyecto sin modificar nada:
- rutas de CLAUDE.md y de .claude/context/*.md;
- rutas de la memoria del proyecto en la carpeta de documentación que declare CLAUDE.md (por defecto docs/, puede estar fuera de git): decisiones/README.md, hallazgos.md, notas/*.md abiertas (no notas/archivo/) y GLOSSARY.md;
- plugins activos del marketplace ai-bank en .claude/settings.json (enabledPlugins);
- agentes de esos plugins que no tienen .claude/context/<agente>.md. Los agentes son:
  - dev: arquitecto, revisor-plan, implementador, verificador, revisor-codigo, revisor-ux;
  - meta: arquitecto-agentes, guardian, investigador.`,
  { label: 'inventario', phase: 'Inventario', schema: INVENTARIO },
)
if (!inv) throw new Error('No se pudo hacer el inventario')

const ficheros = [inv.claude_md, ...inv.contextos, ...(inv.memoria || [])].filter(Boolean)
if (!ficheros.length) return 'El proyecto no tiene CLAUDE.md ni .claude/context/. Ejecuta /core:init-context.'

phase('Contrastar')
const [derivas, guardian] = await Promise.all([
  pipeline(ficheros, f => agent(
    `Contrasta ${f} con el estado real del repo sin modificar nada. Comprueba cada afirmación verificable:
- los comandos existen y se llaman así (scripts, Makefile, CI);
- las rutas y los ficheros citados existen;
- la rama base, las versiones y las herramientas coinciden;
- las convenciones descritas se siguen en el código reciente (git log -20 y muestra de ficheros).
Si es memoria del proyecto (skill core:memoria):
- el índice de decisiones cuadra con los ficheros y estados;
- las decisiones aceptadas siguen cumpliéndose en el código; si no, ¿falta una que las sustituya?
- los hallazgos siguen siendo ciertos;
- las notas de trabajo cuadran con git (rama, commits, ficheros sin commit).
Señala también:
- datos duplicados con CLAUDE.md u otros contextos (deben vivir en un solo sitio);
- lo que Claude deduciría leyendo el código (sobra);
- secretos o datos sensibles;
- trampas evidentes en los commits recientes que no aparecen en la sección Gotchas.
Solo problemas con evidencia.`,
    { label: `contrastar:${f.split('/').pop()}`, phase: 'Contrastar', schema: DERIVA },
  )),
  agent(
    `Auditoría completa de la estructura de agentes y contexto de este proyecto: CLAUDE.md, .claude/settings.json, .claude/context/, .claude/skills/ y .claude/agents/ si existen.`,
    { agentType: 'meta:guardian', label: 'guardian', phase: 'Contrastar' },
  ),
])

const conProblemas = derivas.filter(Boolean).filter(d => d.problemas.length)

phase('Propuestas')
return await agent(
  `Redacta en español las propuestas de actualización del contexto del proyecto, para que el usuario apruebe una a una. Sin añadir problemas propios.
1. Por fichero: cada problema (tipo, sección, evidencia) y el cambio exacto propuesto (texto que se añade, cambia o quita). Primero los secretos y lo falso.
2. Agentes sin contexto: ${inv.agentes_sin_contexto.length ? inv.agentes_sin_contexto.join(', ') + ' → proponer /core:init-context ' + inv.agentes_sin_contexto.join(' ') : 'ninguno'}.
3. Hallazgos del guardián, tal cual, por gravedad.
4. Aprendizajes que parezcan generalizables, como candidatos para /core:retro.
Recuerda al final que no se ha escrito nada: los cambios se aplican tras aprobarlos.

Contrastes: ${JSON.stringify(conProblemas, null, 1)}

Guardián:
${guardian || '(sin resultado)'}`,
  { label: 'propuestas', phase: 'Propuestas' },
)

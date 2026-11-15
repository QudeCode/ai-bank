export const meta = {
  name: 'auditar-proyecto',
  description: 'Audita el contexto específico del proyecto (CLAUDE.md, .claude/context/, memoria y skills del proyecto) frente al código y la estructura de agentes, y propone actualizaciones concretas',
  whenToUse: 'Periódicamente, tras cambios grandes en el proyecto o cuando los agentes fallan por contexto desactualizado. Sin args. Se lanza con la herramienta Workflow: { name: "meta:auditar-proyecto", args }; la herramienta Skill solo devuelve esta instrucción.',
  phases: [
    { title: 'Inventario', detail: 'ficheros de contexto, memoria, skills del proyecto y plugins activos' },
    { title: 'Contrastar', detail: 'contexto, memoria y skills frente al código (un agente por grupo), más el guardián' },
    { title: 'Propuestas', detail: 'cambios concretos para aprobar' },
  ],
}

const INVENTARIO = {
  type: 'object',
  required: ['contextos', 'memoria', 'skills_proyecto', 'enlaces_rotos', 'agentes_sin_contexto', 'claude_md'],
  properties: {
    contextos: { type: 'array', items: { type: 'string' }, description: 'Rutas de .claude/context/*.md' },
    memoria: { type: 'array', items: { type: 'string' }, description: 'Rutas de la memoria del proyecto: índice de decisiones, hallazgos.md, notas de trabajo abiertas, GLOSSARY.md' },
    skills_proyecto: { type: 'array', items: { type: 'string' }, description: 'Rutas de .claude/skills/*/SKILL.md y .agents/skills/*/SKILL.md' },
    enlaces_rotos: { type: 'array', items: { type: 'string' }, description: 'Enlaces simbólicos rotos en .claude/ y .agents/' },
    agentes_sin_contexto: { type: 'array', items: { type: 'string' }, description: 'Agentes del banco de los plugins activos sin .claude/context/<agente>.md' },
    claude_md: { type: 'string', description: 'Ruta de CLAUDE.md o vacío si no existe' },
  },
}

const DERIVA = {
  type: 'object',
  required: ['problemas'],
  properties: {
    problemas: {
      type: 'array',
      items: {
        type: 'object',
        required: ['fichero', 'tipo', 'seccion', 'detalle', 'propuesta'],
        properties: {
          fichero: { type: 'string' },
          tipo: { type: 'string', enum: ['desactualizado', 'falso', 'duplicado', 'falta', 'sobra', 'secreto'] },
          seccion: { type: 'string' },
          detalle: { type: 'string', description: 'Qué dice frente a qué hay, con la evidencia (archivo:línea o comando)' },
          propuesta: { type: 'string', description: 'Texto exacto que se añade, cambia o quita' },
        },
      },
    },
  },
}

const COMUN = `Sin modificar nada. Solo problemas con evidencia (archivo:línea o comando). Lectura acotada: busca con Grep y lee con offset/limit los ficheros largos; no leas documentos largos enteros.`

phase('Inventario')
const inv = await agent(
  `Haz inventario del contexto específico de este proyecto sin modificar nada y sin leer el contenido de los ficheros (solo rutas):
- rutas de CLAUDE.md y de .claude/context/*.md;
- rutas de la memoria del proyecto en la carpeta de documentación que declare CLAUDE.md (por defecto docs/, puede estar fuera de git): decisiones/README.md, hallazgos.md, notas/*.md abiertas (no notas/archivo/) y GLOSSARY.md;
- rutas de las skills del proyecto (.claude/skills/*/SKILL.md y .agents/skills/*/SKILL.md);
- enlaces simbólicos rotos en .claude/ y .agents/ (find .claude .agents -xtype l);
- plugins activos del marketplace ai-bank en .claude/settings.json (enabledPlugins);
- agentes de esos plugins que no tienen .claude/context/<agente>.md. Los agentes son:
  - dev: arquitecto, revisor-plan, implementador, verificador, revisor-codigo, revisor-ux;
  - meta: arquitecto-agentes, guardian, investigador.`,
  { label: 'inventario', phase: 'Inventario', schema: INVENTARIO, model: 'haiku', effort: 'low' },
)
if (!inv) throw new Error('No se pudo hacer el inventario')

const grupos = [
  {
    clave: 'contexto',
    ficheros: [inv.claude_md, ...inv.contextos].filter(Boolean),
    encargo: `Contrasta CLAUDE.md y los contextos con el estado real del repo. Comprueba cada afirmación verificable:
- los comandos existen y se llaman así (scripts, Makefile, CI);
- las rutas y los ficheros citados existen;
- la rama base, las versiones y las herramientas coinciden;
- las convenciones descritas se siguen en el código reciente (git log -20 y muestra de ficheros).
Señala también: datos duplicados entre estos ficheros (deben vivir en un solo sitio), lo que Claude deduciría leyendo el código (sobra), secretos o datos sensibles, y trampas evidentes de los commits recientes que no están en Gotchas.`,
  },
  {
    clave: 'memoria',
    ficheros: inv.memoria || [],
    encargo: `Contrasta la memoria del proyecto (skill core:memoria) con el repo:
- el índice de decisiones cuadra con los ficheros y estados (no leas cada decisión entera: el índice y una muestra de las que afectan a código reciente);
- las decisiones muestreadas siguen cumpliéndose en el código; si no, ¿falta una que las sustituya?
- los hallazgos siguen siendo ciertos;
- las notas de trabajo abiertas cuadran con git (rama, commits, ficheros sin commit).`,
  },
  {
    clave: 'skills',
    ficheros: inv.skills_proyecto || [],
    encargo: `Contrasta las skills del proyecto con el código. Son conocimiento que los agentes cargan y dan por cierto, así que una afirmación falsa se propaga:
- cada mecanismo descrito (autenticación, sesiones, permisos, colas, almacenamiento) es el que usa el código;
- los módulos, carpetas, entidades y rutas citados existen, y no faltan módulos principales;
- los comandos y versiones coinciden.
Marca como «falso» lo que el código contradice y como «desactualizado» lo que falta o cambió.`,
  },
].filter(g => g.ficheros.length)

phase('Contrastar')
const [derivas, guardian] = await Promise.all([
  pipeline(grupos, g => agent(
    `${g.encargo}\n\nFicheros: ${g.ficheros.join(', ')}.\n${COMUN}`,
    { label: `contrastar:${g.clave}`, phase: 'Contrastar', schema: DERIVA, model: 'sonnet' },
  ).then(r => r && { grupo: g.clave, ...r })),
  agent(
    `Audita la estructura de agentes y contexto de este proyecto: CLAUDE.md, .claude/settings.json, .claude/context/, .claude/skills/ y .claude/agents/ si existen. Céntrate en estructura y convenciones (duplicados con el banco, sitio de cada dato, tamaño, permisos); el contraste con el código lo hacen otros agentes.`,
    { agentType: 'meta:guardian', label: 'guardian', phase: 'Contrastar' },
  ),
])

const problemas = derivas.filter(Boolean).flatMap(d => d.problemas || [])
const caidos = grupos.map(g => g.clave).filter(c => !derivas.some(d => d && d.grupo === c))
if (caidos.length) log(`Sin resultado de: ${caidos.join(', ')}`)

phase('Propuestas')
return await agent(
  `Redacta en español las propuestas de actualización del contexto del proyecto, para que el usuario apruebe una a una. Sin añadir problemas propios.
1. Por fichero: cada problema (tipo, sección, evidencia) y el cambio exacto propuesto (texto que se añade, cambia o quita). Primero los secretos y lo falso.
2. Enlaces simbólicos rotos: ${inv.enlaces_rotos.length ? inv.enlaces_rotos.join(', ') + ' → proponer arreglarlos o quitarlos' : 'ninguno'}.
3. Agentes sin contexto: ${inv.agentes_sin_contexto.length ? inv.agentes_sin_contexto.join(', ') + ' → proponer /core:init-context ' + inv.agentes_sin_contexto.join(' ') : 'ninguno'}.
4. Hallazgos del guardián, tal cual, por gravedad.
5. Aprendizajes que parezcan generalizables, como candidatos para /core:retro.
${caidos.length ? `Avisa de que no hubo resultado del grupo: ${caidos.join(', ')}.` : ''}
Recuerda al final que no se ha escrito nada: los cambios se aplican tras aprobarlos.

Problemas: ${JSON.stringify(problemas, null, 1)}

Guardián:
${guardian || '(sin resultado)'}`,
  { label: 'propuestas', phase: 'Propuestas', model: 'sonnet', effort: 'low' },
)

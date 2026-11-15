export const meta = {
  name: 'revisar-plan',
  description: 'Revisa un plan de implementación con los roles de dev:revisor-plan que pida su nivel (ligero: adversario; normal: + reutilizacion y concrecion; completo: los cuatro) y une los hallazgos en un solo informe',
  whenToUse: 'Tras redactar un plan con dev:arquitecto y antes de pedir su aprobación. args: { plan: "<ruta del plan>", nivel: "ligero"|"normal"|"completo" } o la ruta como texto. El nivel se clasifica siempre; lo que cumple la definición de completo nunca se rebaja. Se lanza con la herramienta Workflow: { name: "dev:revisar-plan", args }; la herramienta Skill solo devuelve esta instrucción.',
  phases: [
    { title: 'Nivel', detail: 'nivel del plan si no viene dado' },
    { title: 'Revisar', detail: 'roles del nivel en paralelo' },
    { title: 'Consolidar', detail: 'deduplicar y ordenar por gravedad' },
  ],
}

const entrada = typeof args === 'string' ? { plan: args } : (args || {})
const plan = entrada.plan
if (!plan) {
  throw new Error('Falta la ruta del plan: pasa args { plan: "docs/plans/<slug>.md" }')
}
const NIVELES = ['ligero', 'normal', 'completo']
// Niveles: copia literal de core:orquestacion «Coste»
const DEF_NIVELES = `- completo: toca autenticación, permisos, seguridad, migraciones o esquema de datos, el contrato entre capas, o crea un módulo;
- ligero: hasta ~150 líneas en una sola capa y nada de lo anterior;
- normal: el resto.`

const HALLAZGOS = {
  type: 'object',
  required: ['hallazgos', 'resumen'],
  properties: {
    resumen: { type: 'string', description: 'Una o dos frases. En el rol explicar, tu reformulación del plan.' },
    hallazgos: {
      type: 'array',
      items: {
        type: 'object',
        required: ['gravedad', 'seccion', 'problema', 'resolucion'],
        properties: {
          gravedad: { type: 'string', enum: ['Bloquea', 'Conviene', 'Sugerencia'] },
          seccion: { type: 'string', description: 'Sección del plan' },
          codigo: { type: 'string', description: 'archivo:línea si toca código; vacío si no' },
          problema: { type: 'string' },
          resolucion: { type: 'string' },
        },
      },
    },
  },
}

const NIVEL = {
  type: 'object',
  required: ['nivel', 'motivos_completo'],
  properties: {
    nivel: { type: 'string', enum: NIVELES },
    motivos_completo: { type: 'array', items: { type: 'string' }, description: 'Lo que el plan toca que cumple la definición de completo; vacío si nada' },
  },
}

phase('Nivel')
const r = await agent(
  `Lee solo el plan ${plan} (no el código) y clasifica su nivel de revisión con esta definición:
${DEF_NIVELES}
Para «líneas», estima por los cambios del plan. Si el plan declara un único «Nivel: …», tenlo en cuenta, pero lista igualmente en motivos_completo todo lo que cumpla la definición de completo.`,
  { label: 'nivel', phase: 'Nivel', schema: NIVEL, model: 'haiku', effort: 'low' },
)
const motivos = (r && r.motivos_completo) || []
let nivel = NIVELES.includes(entrada.nivel) ? entrada.nivel : ((r && NIVELES.includes(r.nivel)) ? r.nivel : 'normal')
if (motivos.length && nivel !== 'completo') {
  log(`Nivel ${nivel} subido a completo: ${motivos.join('; ')}`)
  nivel = 'completo'
}

const ROLES = {
  ligero: [{ rol: 'adversario', encargo: 'adversario, incluyendo concrecion', model: 'opus' }],
  normal: [
    { rol: 'adversario', encargo: 'adversario', model: 'opus' },
    { rol: 'reutilizacion', encargo: 'reutilizacion', model: 'sonnet' },
    { rol: 'concrecion', encargo: 'concrecion', model: 'sonnet' },
  ],
  completo: [
    { rol: 'adversario', encargo: 'adversario', model: 'opus' },
    { rol: 'reutilizacion', encargo: 'reutilizacion', model: 'sonnet' },
    { rol: 'concrecion', encargo: 'concrecion', model: 'sonnet' },
    { rol: 'explicar', encargo: 'explicar', model: 'sonnet' },
  ],
}[nivel]
log(`Nivel ${nivel}: ${ROLES.map(r => r.rol).join(', ')}`)

phase('Revisar')
const resultados = await parallel(ROLES.map(r => () =>
  agent(
    `Rol: ${r.encargo}. Revisa el plan ${plan} según tu rol. Parte de su «Mapa del código» y abre otros ficheros solo para confirmar o refutar algo. Devuelve solo hallazgos que cambiarían el plan; si no hay nada significativo, devuelve la lista vacía.`,
    { agentType: 'dev:revisor-plan', label: `revisor-plan:${r.rol}`, phase: 'Revisar', schema: HALLAZGOS, model: r.model },
  ).then(x => x && { rol: r.rol, ...x }),
))

const validos = resultados.filter(Boolean)
const caidos = ROLES.map(r => r.rol).filter(rol => !validos.some(v => v.rol === rol))
if (caidos.length) log(`Sin resultado de: ${caidos.join(', ')}`)

phase('Consolidar')
const informe = await agent(
  `Une estos hallazgos de revisión del plan ${plan} en un solo informe en español.
- Primera línea: «Nivel ${nivel}» y los roles que revisaron.
- Fusiona los duplicados (mismo problema visto por varios roles), conservando la gravedad más alta y citando los roles que lo vieron.
- Ordena: Bloquea, Conviene, Sugerencia. Cada hallazgo: sección, archivo:línea si lo hay, problema y resolución.
- Si hay reformulación del rol explicar, empieza con ella en 3 líneas como máximo.
- Termina con una línea: «Plan listo para aprobar» o «Pendiente: N hallazgos que bloquean».
- No añadas hallazgos propios y omite los que no piden ningún cambio.
${caidos.length ? `- Avisa de que estos roles no devolvieron resultado: ${caidos.join(', ')}.` : ''}

Hallazgos (JSON):
${JSON.stringify(validos, null, 1)}`,
  { label: 'consolidar', phase: 'Consolidar', model: 'sonnet', effort: 'low' },
)

return informe

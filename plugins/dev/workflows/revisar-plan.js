export const meta = {
  name: 'revisar-plan',
  description: 'Revisa un plan de implementación con los cuatro roles de dev:revisor-plan en paralelo y une los hallazgos en un solo informe',
  whenToUse: 'Tras redactar un plan con dev:arquitecto y antes de pedir su aprobación. args: { plan: "<ruta del plan>" } o la ruta como texto.',
  phases: [
    { title: 'Revisar', detail: 'explicar, adversario, reutilizacion y concrecion en paralelo' },
    { title: 'Consolidar', detail: 'deduplicar y ordenar por gravedad' },
  ],
}

const plan = typeof args === 'string' ? args : args && args.plan
if (!plan) {
  throw new Error('Falta la ruta del plan: pasa args { plan: "docs/plans/<slug>.md" }')
}

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

const ROLES = ['explicar', 'adversario', 'reutilizacion', 'concrecion']

phase('Revisar')
const resultados = await parallel(ROLES.map(rol => () =>
  agent(
    `Rol: ${rol}. Revisa el plan ${plan} según tu rol. Devuelve solo hallazgos que cambiarían el plan; si no hay nada significativo, devuelve la lista vacía.`,
    { agentType: 'dev:revisor-plan', label: `revisor-plan:${rol}`, phase: 'Revisar', schema: HALLAZGOS },
  ).then(r => r && { rol, ...r }),
))

const validos = resultados.filter(Boolean)
const caidos = ROLES.filter(rol => !validos.some(v => v.rol === rol))
if (caidos.length) log(`Sin resultado de: ${caidos.join(', ')}`)

phase('Consolidar')
const informe = await agent(
  `Une estos hallazgos de revisión del plan ${plan} en un solo informe en español.
- Fusiona los duplicados (mismo problema visto por varios roles), conservando la gravedad más alta y citando los roles que lo vieron.
- Ordena: Bloquea, Conviene, Sugerencia. Cada hallazgo: sección, archivo:línea si lo hay, problema y resolución.
- Empieza con la reformulación del rol explicar (si existe) en 3 líneas como máximo.
- Termina con una línea: «Plan listo para aprobar» o «Pendiente: N hallazgos que bloquean».
- No añadas hallazgos propios.
${caidos.length ? `- Avisa de que estos roles no devolvieron resultado: ${caidos.join(', ')}.` : ''}

Hallazgos (JSON):
${JSON.stringify(validos, null, 1)}`,
  { label: 'consolidar', phase: 'Consolidar' },
)

return informe

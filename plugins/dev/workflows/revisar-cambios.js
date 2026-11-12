export const meta = {
  name: 'revisar-cambios',
  description: 'Verifica y revisa los cambios de la rama en paralelo (verificador, revisor-codigo en modos correccion y calidad, y revisor-ux si toca UI) y devuelve un informe único',
  whenToUse: 'Tras implementar y antes de pedir aprobación para el commit. args opcionales: { diff, stat, plan, base, ui }. Sin diff, se genera contra la rama base.',
  phases: [
    { title: 'Preparar', detail: 'diff de la rama en un fichero temporal' },
    { title: 'Revisar', detail: 'verificador y revisores en paralelo' },
    { title: 'Consolidar', detail: 'informe único ordenado' },
  ],
}

const entrada = (args && typeof args === 'object') ? args : {}

const PREPARADO = {
  type: 'object',
  required: ['diff', 'stat', 'base', 'toca_ui', 'vacio'],
  properties: {
    diff: { type: 'string', description: 'Ruta absoluta del fichero con el diff' },
    stat: { type: 'string', description: 'Ruta absoluta del fichero con git diff --stat' },
    base: { type: 'string' },
    toca_ui: { type: 'boolean', description: 'Si el diff toca vistas, componentes, estilos o HTML' },
    vacio: { type: 'boolean' },
  },
}

phase('Preparar')
let prep = null
if (entrada.diff) {
  prep = { diff: entrada.diff, stat: entrada.stat || '', base: entrada.base || '', toca_ui: Boolean(entrada.ui), vacio: false }
} else {
  prep = await agent(
    `Prepara la revisión de los cambios de la rama actual sin modificar el repo.
1. Rama base: ${entrada.base ? `"${entrada.base}"` : 'la que indique .claude/context/verificador.md o .claude/context/revisor-codigo.md; si no, la rama por defecto del remoto (git symbolic-ref refs/remotes/origin/HEAD) o main/master'}.
2. Crea un directorio temporal FUERA del repo con mktemp -d y escribe en él:
   - diff.patch: git diff <base>...HEAD seguido de git diff (cambios sin commit) y git diff --cached.
   - diff.stat: git diff --stat <base>...HEAD y git diff --stat.
3. Decide si el diff toca interfaz de usuario (vistas, componentes, estilos, plantillas HTML).
Devuelve las rutas absolutas, la base usada, toca_ui y vacio (true si no hay cambios).`,
    { label: 'preparar-diff', phase: 'Preparar', schema: PREPARADO },
  )
  if (!prep) throw new Error('No se pudo preparar el diff')
}
if (prep.vacio) return 'No hay cambios que revisar respecto a la rama base.'
if (entrada.ui !== undefined) prep.toca_ui = Boolean(entrada.ui)

const planTxt = entrada.plan ? ` Plan de referencia: ${entrada.plan}.` : ''
const ficheros = `Diff: ${prep.diff}.${prep.stat ? ` Stat: ${prep.stat}.` : ''}${planTxt}`

const tareas = [
  { clave: 'verificador', tipo: 'dev:verificador', prompt: `Verifica la rama actual (base: ${prep.base || 'la del contexto'}). Alcance: lo que cambia en ${prep.stat || prep.diff}.` },
  { clave: 'correccion', tipo: 'dev:revisor-codigo', prompt: `Modo: correccion. ${ficheros}` },
  { clave: 'calidad', tipo: 'dev:revisor-codigo', prompt: `Modo: calidad. ${ficheros}` },
]
if (prep.toca_ui) tareas.push({ clave: 'ux', tipo: 'dev:revisor-ux', prompt: `Revisa la UX y la accesibilidad de los cambios de interfaz. ${ficheros}` })
else log('El diff no toca UI: se omite dev:revisor-ux')

phase('Revisar')
const informes = await parallel(tareas.map(t => () =>
  agent(t.prompt, { agentType: t.tipo, label: t.clave, phase: 'Revisar' }).then(r => r && { de: t.clave, informe: r }),
))

const recibidos = informes.filter(Boolean)
const faltan = tareas.map(t => t.clave).filter(c => !recibidos.some(r => r.de === c))
if (faltan.length) log(`Sin resultado de: ${faltan.join(', ')}`)

phase('Consolidar')
return await agent(
  `Une estos informes en uno solo, en español, sin añadir hallazgos propios.
1. Primero el estado del verificador tal cual (una línea por comprobación y su veredicto). Separa los fallos nuevos de los preexistentes.
2. Después los hallazgos de los revisores, deduplicados (si dos ven lo mismo, uno solo con la gravedad más alta y quién lo vio), en orden Bloquea → Conviene → Sugerencia. Cada uno con archivo:línea, el problema y el arreglo; los de calidad, marcados ahora o diferir.
3. Las «Propuestas para el contexto» de todos los agentes, juntas al final, sin perder ninguna ni su marca (generalizable).
4. Veredicto final en una línea: «Listo para commit» o «Pendiente: N que bloquean / verificación en rojo».
${faltan.length ? `Avisa de que no hubo resultado de: ${faltan.join(', ')}.` : ''}

Informes:
${recibidos.map(r => `### ${r.de}\n${r.informe}`).join('\n\n')}`,
  { label: 'consolidar', phase: 'Consolidar' },
)

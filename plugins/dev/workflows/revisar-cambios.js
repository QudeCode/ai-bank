export const meta = {
  name: 'revisar-cambios',
  description: 'Verifica y revisa los cambios de la rama en paralelo (verificador, revisor-codigo en correccion y, según el nivel, calidad, y revisor-ux si toca UI) y devuelve un informe único',
  whenToUse: 'Tras implementar y antes de pedir aprobación para el commit. args opcionales: { base, plan, nivel: "ligero"|"normal"|"completo", ui, repo, diff, stat }. Sin diff, se genera contra la rama base. El nivel se clasifica siempre; lo que cumple la definición de completo nunca se rebaja. Se lanza con la herramienta Workflow: { name: "dev:revisar-cambios", args }; la herramienta Skill solo devuelve esta instrucción.',
  phases: [
    { title: 'Preparar', detail: 'diff de la rama en un fichero temporal y nivel de revisión' },
    { title: 'Revisar', detail: 'verificador y revisores en paralelo, según el nivel' },
    { title: 'Consolidar', detail: 'informe único ordenado' },
  ],
}

const entrada = (args && typeof args === 'object') ? args : {}
const NIVELES = ['ligero', 'normal', 'completo']
// Niveles: copia literal de core:orquestacion «Coste»
const DEF_NIVELES = `- completo: toca autenticación, permisos, seguridad, migraciones o esquema de datos, el contrato entre capas, o crea un módulo;
- ligero: hasta ~150 líneas en una sola capa y nada de lo anterior;
- normal: el resto.`

const PREPARADO = {
  type: 'object',
  required: ['diff', 'stat', 'base', 'repo', 'toca_ui', 'vacio', 'bytes', 'lineas', 'motivos_completo', 'nivel'],
  properties: {
    diff: { type: 'string', description: 'Ruta absoluta del fichero con el diff' },
    stat: { type: 'string', description: 'Ruta absoluta del fichero con git diff --stat' },
    base: { type: 'string' },
    repo: { type: 'string', description: 'Ruta absoluta del repo git (puede ser una subcarpeta del directorio de trabajo)' },
    toca_ui: { type: 'boolean', description: 'Si el diff toca vistas, componentes, estilos o HTML' },
    vacio: { type: 'boolean', description: 'true solo si no hay cambios respecto a la base' },
    bytes: { type: 'number', description: 'Tamaño de diff.patch según wc -c; 0 si no se pudo escribir' },
    error: { type: 'string', description: 'Motivo si no se pudo preparar el diff' },
    en_trabajo: { type: 'boolean', description: 'true si el diff quedó dentro del directorio de trabajo (.revisar-cambios/)' },
    lineas: { type: 'number', description: 'Líneas añadidas + borradas' },
    motivos_completo: { type: 'array', items: { type: 'string' }, description: 'Cada fichero o cambio que cumple la definición de completo, con el motivo; vacío si ninguno' },
    nivel: { type: 'string', enum: NIVELES },
  },
}

phase('Preparar')
const clasificar = `Mide: lineas (añadidas + borradas), toca_ui (vistas, componentes, estilos, plantillas HTML) y motivos_completo. Clasifica el nivel con esta definición, mirando las rutas del stat y, si hace falta, las cabeceras de los hunks:
${DEF_NIVELES}
No leas el código más allá de lo necesario para clasificar.`
let prep = null
if (entrada.diff) {
  prep = await agent(
    `Clasifica un diff ya preparado sin modificar nada. Diff: ${entrada.diff}.${entrada.stat ? ` Stat: ${entrada.stat}.` : ''}
Devuelve diff y stat tal cual, base "${entrada.base || ''}", repo "${entrada.repo || ''}", vacio=false y bytes (wc -c del diff).
${clasificar}`,
    { label: 'clasificar-diff', phase: 'Preparar', schema: PREPARADO, model: 'haiku', effort: 'low' },
  )
  if (!prep) throw new Error('No se pudo clasificar el diff')
} else {
  prep = await agent(
    `Prepara la revisión de los cambios de la rama actual sin modificar el repo.
1. Repo: ${entrada.repo ? `"${entrada.repo}"` : 'el directorio actual o, si no es un repo git, la subcarpeta que lo sea (busca .git a un nivel)'}. Ejecuta git siempre con git -C <repo>.
2. Rama base: ${entrada.base ? `"${entrada.base}"` : 'la que indique .claude/context/verificador.md o .claude/context/revisor-codigo.md; si no, la rama por defecto del remoto (git symbolic-ref refs/remotes/origin/HEAD) o main/master'}.
3. Elige dónde escribir, en este orden: el scratchpad de la sesión si tus instrucciones nombran uno; si no, un directorio de mktemp -d; si no puedes escribir fuera, <directorio de trabajo>/.revisar-cambios/ (nunca dentro de .git ni de .claude) y en_trabajo=true. Usa comandos simples, uno por llamada, sin variables ni &&. Escribe, sobrescribiendo lo que haya:
   - diff.patch: git diff <base>...HEAD seguido de git diff (cambios sin commit) y git diff --cached.
   - diff.stat: git diff --stat <base>...HEAD y git diff --stat.
   Comprueba con wc -c el tamaño de diff.patch y devuélvelo en bytes. Si no pudiste escribirlo, bytes=0 y el motivo en error. vacio=true solo si git no muestra ningún cambio.
4. ${clasificar}`,
    { label: 'preparar-diff', phase: 'Preparar', schema: PREPARADO, model: 'haiku', effort: 'low' },
  )
  if (!prep) throw new Error('No se pudo preparar el diff')
}
if (prep.vacio) return 'No hay cambios que revisar respecto a la rama base.'
if (!prep.diff || !(prep.bytes > 0)) throw new Error(`No se pudo preparar el diff${prep.error ? `: ${prep.error}` : ''}. Genera diff.patch y diff.stat y pásalos en args { diff, stat }.`)
if (entrada.ui !== undefined) prep.toca_ui = Boolean(entrada.ui)
const motivos = prep.motivos_completo || []
let nivel = NIVELES.includes(entrada.nivel) ? entrada.nivel : (NIVELES.includes(prep.nivel) ? prep.nivel : 'normal')
if (motivos.length && nivel !== 'completo') {
  log(`Nivel ${nivel} subido a completo: ${motivos.join('; ')}`)
  nivel = 'completo'
}
log(`Nivel ${nivel}: ${prep.lineas || '?'} líneas${motivos.length ? `; ${motivos.join('; ')}` : ''}`)

const planTxt = entrada.plan ? ` Plan de referencia: ${entrada.plan}.` : ''
const repoTxt = prep.repo ? ` Repo: ${prep.repo}.` : ''
const ficheros = `Diff: ${prep.diff}.${prep.stat ? ` Stat: ${prep.stat}.` : ''}${repoTxt}${planTxt} Parte del diff y del plan; abre otros ficheros solo para confirmar o refutar un hallazgo.`
const alto = nivel === 'completo' ? { effort: 'high' } : {}

const tareas = [
  { clave: 'verificador', tipo: 'dev:verificador', prompt: `Verifica la rama actual (base: ${prep.base || 'la del contexto'}).${repoTxt} Alcance: lo que cambia en ${prep.stat || prep.diff}.`, opts: {} },
  { clave: 'correccion', tipo: 'dev:revisor-codigo', prompt: `Modo: correccion. ${ficheros}`, opts: { model: 'opus', ...alto } },
]
if (nivel !== 'ligero') tareas.push({ clave: 'calidad', tipo: 'dev:revisor-codigo', prompt: `Modo: calidad. ${ficheros}`, opts: { model: 'sonnet' } })
else log('Nivel ligero: se omite revisor-codigo en modo calidad')
if (prep.toca_ui) tareas.push({ clave: 'ux', tipo: 'dev:revisor-ux', prompt: `Revisa la UX y la accesibilidad de los cambios de interfaz. ${ficheros}`, opts: { model: 'sonnet' } })
else log('El diff no toca UI: se omite dev:revisor-ux')

phase('Revisar')
const informes = await parallel(tareas.map(t => () =>
  agent(t.prompt, { agentType: t.tipo, label: t.clave, phase: 'Revisar', ...t.opts }).then(r => r && { de: t.clave, informe: r }),
))

const recibidos = informes.filter(Boolean)
const faltan = tareas.map(t => t.clave).filter(c => !recibidos.some(r => r.de === c))
if (faltan.length) log(`Sin resultado de: ${faltan.join(', ')}`)

phase('Consolidar')
return await agent(
  `Une estos informes en uno solo, en español, sin añadir hallazgos propios y omitiendo los puntos que no piden ningún cambio.
0. Primera línea: «Nivel ${nivel}» y qué revisores corrieron (${tareas.map(t => t.clave).join(', ')}).
1. El estado del verificador tal cual (una línea por comprobación y su veredicto). Separa los fallos nuevos de los preexistentes.
2. Después los hallazgos de los revisores, deduplicados (si dos ven lo mismo, uno solo con la gravedad más alta y quién lo vio), en orden Bloquea → Conviene → Sugerencia. Cada uno con archivo:línea, el problema y el arreglo; los de calidad, marcados ahora o diferir.
3. Las «Propuestas para el contexto» de todos los agentes, juntas al final, sin perder ninguna ni su marca (generalizable).
4. Veredicto final en una línea: «Listo para commit» o «Pendiente: N que bloquean / verificación en rojo».
${faltan.length ? `Avisa de que no hubo resultado de: ${faltan.join(', ')}.` : ''}
${prep.en_trabajo ? `5. Avisa al final: el diff quedó en ${prep.diff.replace(/\/[^/]*$/, '')}, dentro del directorio de trabajo; bórralo y no lo incluyas en el commit.` : ''}

Informes:
${recibidos.map(r => `### ${r.de}\n${r.informe}`).join('\n\n')}`,
  { label: 'consolidar', phase: 'Consolidar', model: 'sonnet', effort: 'low' },
)

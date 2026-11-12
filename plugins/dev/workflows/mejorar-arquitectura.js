export const meta = {
  name: 'mejorar-arquitectura',
  description: 'Busca oportunidades de profundizar módulos en las zonas calientes del repo, las somete a crítica adversarial y devuelve un informe de candidatos para elegir uno',
  whenToUse: 'Cuando el código cuesta de cambiar o de probar y quieres candidatos de refactor con argumentos. args opcionales: { foco: "<módulo, carpeta o dolor concreto>", zonas: 4 }.',
  phases: [
    { title: 'Zonas', detail: 'zonas calientes según git log o el foco dado' },
    { title: 'Explorar', detail: 'un explorador por zona busca módulos superficiales' },
    { title: 'Criticar', detail: 'cada candidato, contra el test de borrado y los ADR' },
    { title: 'Informe', detail: 'candidatos que sobreviven y recomendación' },
  ],
}

const entrada = (args && typeof args === 'object') ? args : (typeof args === 'string' ? { foco: args } : {})
const MAX_ZONAS = Math.min(Math.max(Number(entrada.zonas) || 4, 1), 8)

const ZONAS = {
  type: 'object',
  required: ['zonas'],
  properties: {
    zonas: {
      type: 'array',
      items: {
        type: 'object',
        required: ['nombre', 'rutas', 'motivo'],
        properties: { nombre: { type: 'string' }, rutas: { type: 'array', items: { type: 'string' } }, motivo: { type: 'string' } },
      },
    },
  },
}

const CANDIDATOS = {
  type: 'object',
  required: ['candidatos'],
  properties: {
    candidatos: {
      type: 'array',
      items: {
        type: 'object',
        required: ['titulo', 'ficheros', 'problema', 'solucion', 'beneficios', 'dependencias'],
        properties: {
          titulo: { type: 'string' },
          ficheros: { type: 'array', items: { type: 'string' } },
          problema: { type: 'string', description: 'Fricción actual, en términos de profundidad, localidad y seams' },
          solucion: { type: 'string', description: 'Qué cambiaría, sin diseñar aún la interfaz' },
          beneficios: { type: 'string', description: 'Palanca, localidad y cómo mejorarían los tests' },
          dependencias: { type: 'string', description: 'Categoría: en proceso, sustituible en local, remota propia o externa' },
        },
      },
    },
  },
}

const VEREDICTO = {
  type: 'object',
  required: ['sobrevive', 'fuerza', 'motivo'],
  properties: {
    sobrevive: { type: 'boolean' },
    fuerza: { type: 'string', enum: ['Fuerte', 'Merece explorarse', 'Especulativo'] },
    motivo: { type: 'string' },
    adr: { type: 'string', description: 'ADR con el que choca, si lo hay, y si merece reabrirse' },
  },
}

phase('Zonas')
let zonas
if (entrada.foco) {
  zonas = [{ nombre: entrada.foco, rutas: [], motivo: 'Foco indicado por el usuario' }]
} else {
  const r = await agent(
    `Encuentra las zonas calientes de este repo para buscar mejoras de arquitectura. Usa git log (p. ej. git log --since="6 months ago" --name-only --pretty=format: | sort | uniq -c | sort -rn | head -60) y agrupa los ficheros más cambiados en hasta ${MAX_ZONAS} zonas coherentes (un módulo, una funcionalidad o una capa). Ignora ficheros generados, lockfiles, migraciones ya aplicadas y documentación. No modifiques nada.`,
    { label: 'zonas', phase: 'Zonas', schema: ZONAS },
  )
  zonas = (r && r.zonas || []).slice(0, MAX_ZONAS)
  if (r && r.zonas && r.zonas.length > MAX_ZONAS) log(`Se exploran ${MAX_ZONAS} de ${r.zonas.length} zonas; pasa args.zonas para más`)
}
if (!zonas.length) return 'No se encontraron zonas que explorar. Pasa args { foco: "<módulo o carpeta>" }.'

const evaluados = await pipeline(
  zonas,
  zona => agent(
    `Carga la skill dev:diseno-codigo y usa su vocabulario (módulo, interfaz, profundidad, seam, adaptador, palanca, localidad). Lee GLOSSARY.md y docs/adr/ si existen.
Explora la zona «${zona.nombre}» ${zona.rutas.length ? `(${zona.rutas.join(', ')})` : ''} — motivo: ${zona.motivo}.
Busca fricción real:
- entender un concepto obliga a saltar entre muchos módulos pequeños;
- módulos superficiales;
- funciones extraídas solo para testear con los bugs en cómo se llaman;
- módulos acoplados que se filtran a través de sus seams;
- partes difíciles de probar por su interfaz actual.
Aplica el test de borrado a cada sospechoso. Devuelve como máximo 3 candidatos, solo los que concentrarían complejidad al profundizar. No modifiques nada.`,
    { label: `explorar:${zona.nombre}`, phase: 'Explorar', schema: CANDIDATOS },
  ),
  (res, zona) => parallel(((res && res.candidatos) || []).map(c => () =>
    agent(
      `Intenta refutar este candidato de profundización en la zona «${zona.nombre}». Lee el código citado.
- ¿Pasa el test de borrado o solo movería la complejidad?
- ¿Choca con algún ADR de docs/adr/? Si choca, ¿la fricción justifica reabrirlo?
- ¿Es un seam con un único adaptador (hipotético)?
En caso de duda, sobrevive=false.
Candidato: ${JSON.stringify(c)}`,
      { label: `criticar:${c.titulo}`.slice(0, 60), phase: 'Criticar', schema: VEREDICTO },
    ).then(v => v && { ...c, zona: zona.nombre, veredicto: v }),
  )).then(vs => vs.filter(Boolean)),
)

const todos = evaluados.filter(Boolean).flat()
const sobreviven = todos.filter(c => c.veredicto.sobrevive)
log(`${sobreviven.length} de ${todos.length} candidatos sobreviven a la crítica`)
if (!sobreviven.length) return `Se evaluaron ${todos.length} candidatos en ${zonas.length} zonas y ninguno sobrevivió a la crítica. Descartados:\n${todos.map(c => `- ${c.titulo}: ${c.veredicto.motivo}`).join('\n')}`

phase('Informe')
return await agent(
  `Redacta en español un informe de mejora de arquitectura con estos candidatos, que ya sobrevivieron a una crítica adversarial. Usa el vocabulario de dev:diseno-codigo.
Por candidato: título, zona, ficheros, problema, solución, beneficios (palanca, localidad, tests), dependencias, fuerza (Fuerte / Merece explorarse / Especulativo) y conflicto con ADR si lo hay. Incluye un diagrama ASCII breve antes/después si ayuda.
Termina con «Recomendación principal»: cuál abordaría primero y por qué.
No diseñes todavía las interfaces: el usuario elegirá uno y entonces se aplica «diseñar dos veces» (dev:diseno-codigo, references/profundizar.md).
Lista al final, en una línea cada uno, los descartados y su motivo.

Candidatos: ${JSON.stringify(sobreviven, null, 1)}
Descartados: ${JSON.stringify(todos.filter(c => !c.veredicto.sobrevive).map(c => ({ titulo: c.titulo, motivo: c.veredicto.motivo })))}`,
  { label: 'informe', phase: 'Informe' },
)

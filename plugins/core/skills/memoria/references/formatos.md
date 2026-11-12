# Formatos de la memoria del proyecto

## Decisión — `<docs>/decisiones/NNNN-slug.md`

Número: el siguiente libre de 4 cifras. Slug: kebab-case corto.

```md
# NNNN · <Título corto de la decisión>

Estado: propuesta | aceptada | sustituida por [NNNN](NNNN-slug.md) | obsoleta
Fecha: AAAA-MM-DD · Tipo: decisión | ADR
Sustituye a: [NNNN](NNNN-slug.md)   <!-- solo si aplica -->

## Contexto
<!-- Qué problema o situación obliga a decidir. 1-4 frases. -->

## Decisión
<!-- Qué se decide, en presente: "Se usa X para Y". -->

## Alternativas descartadas
<!-- Solo las reales, con el motivo en una línea. Borra la sección si no hubo. -->

## Consecuencias
<!-- Qué cambia, qué queda prohibido o que hay que vigilar. Borra la sección si no aporta. -->
```

Índice — `<docs>/decisiones/README.md`:

```md
# Decisiones

| Nº | Decisión | Estado | Fecha |
|---|---|---|---|
| [0001](0001-slug.md) | <título> | aceptada · ADR | AAAA-MM-DD |
```

## Hallazgo — `<docs>/hallazgos.md` (solo se añaden entradas)

```md
### AAAA-MM-DD · <Qué se verificó, en una línea>
- **Evidencia:** <cómo se comprobó: comando, log, prueba en el entorno real, captura>
- **Contradice:** <documentación o creencia previa> <!-- o «—» -->
- **Consecuencia:** <qué hay que hacer o evitar; dónde afecta (ficheros, módulos)>
```

Cuando deja de ser cierto, la línea del título pasa a ser: `### ~~AAAA-MM-DD · …~~ (superado AAAA-MM-DD: <motivo>)`.

## Nota de trabajo — `<docs>/notas/<ticket-o-rama>.md` (se reescribe entera)

```md
# <ticket o rama> · <título>

Actualizada: AAAA-MM-DD · Rama: <rama> · Plan: [<slug>](../plans/<slug>.md)

## Objetivo
## Hecho
## Pendiente
## Siguiente paso
<!-- Lo primero que hay que hacer al retomar, concreto. -->
## Sin commit
<!-- Ficheros modificados y por qué siguen así. -->
## Preguntas abiertas
## Decisiones y hallazgos de este trabajo
<!-- Enlaces a decisiones/NNNN y a entradas de hallazgos.md. -->
```

Al cerrar el ticket: se mueve a `notas/archivo/` y se sustituye su contenido por un resumen de tres líneas más los enlaces.

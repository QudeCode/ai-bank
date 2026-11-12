---
name: modelo-dominio
description: Construye y afina el modelo de dominio de un proyecto mientras se diseña — glosario de términos (GLOSSARY.md) y decisiones de arquitectura (ADR en docs/adr/). Úsala cuando se discuten o cambian términos del dominio, aparece un término ambiguo, se decide algo difícil de revertir o hay que escribir o editar el glosario o un ADR. Para solo leer el glosario no hace falta.
---

# Modelo de dominio

Disciplina activa: cuestionar términos, inventar escenarios límite y apuntar el glosario y las decisiones en cuanto cristalizan.

## Dónde va

- **Un solo contexto** (lo habitual): `GLOSSARY.md` en la raíz y `docs/adr/NNNN-slug.md`.
- **Varios contextos**: `GLOSSARY-MAP.md` en la raíz, con la lista de contextos, dónde vive cada uno y cómo se relacionan. Cada contexto tiene su `GLOSSARY.md` y su `docs/adr/`.
- Crea los ficheros **solo cuando haya algo que escribir**.
- Si el contexto del proyecto (`.claude/context/`) dice otra ubicación, manda esa.

## Durante la conversación

- **Contrasta con el glosario**: si se usa un término en otro sentido, dilo en el momento («el glosario define *cancelación* como X; aquí parece Y, ¿cuál es?»).
- **Afina el lenguaje vago**: propone un término canónico («¿*cuenta* es el Cliente o el Usuario?»).
- **Escenarios concretos**: inventa casos límite que obliguen a precisar la frontera entre conceptos.
- **Contrasta con el código**: si lo que se afirma no coincide con lo que hace el código, señálalo.
- **Actualiza `GLOSSARY.md` en el momento** en que un término queda resuelto; no lo dejes para el final.

## Formato del glosario

```md
# <Contexto>

<Una o dos frases: qué es y para qué existe.>

## Lenguaje

**Pedido**:
<Qué es, en una o dos frases.>
_Evitar_: compra, transacción
```

- Opina: si hay varias palabras para lo mismo, elige una y lista las demás en *Evitar*.
- Define qué **es**, no qué hace.
- Solo términos propios de este dominio. Los conceptos generales de programación no van.
- Sin detalles de implementación: es un glosario, no una especificación.

## ADR

Ofrece un ADR solo si se cumplen las tres condiciones:

1. **Difícil de revertir**.
2. **Sorprendente sin contexto**: alguien se preguntará «¿por qué así?».
3. **Fruto de un compromiso real** entre alternativas.

Formato mínimo, `docs/adr/NNNN-slug.md` (siguiente número libre):

```md
# <Título corto de la decisión>

<1-3 frases: contexto, qué se decidió y por qué.>
```

Añade *Estado*, *Opciones consideradas* o *Consecuencias* solo si aportan.

Merecen un ADR:
- la forma de la arquitectura;
- la integración entre contextos;
- tecnologías con dependencia fuerte;
- límites de responsabilidad (también los «no»);
- desviaciones deliberadas de lo obvio;
- restricciones invisibles en el código;
- alternativas rechazadas por motivos no evidentes.

## Gotchas

- Un ADR no se reabre sin un motivo nuevo. Quien proponga algo que un ADR descartó debe citarlo.
- No conviertas el glosario en documentación del código: se queda pequeño o deja de leerse.

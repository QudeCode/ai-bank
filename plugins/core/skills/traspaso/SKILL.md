---
name: traspaso
description: Al pausar o terminar una sesión, deja el trabajo listo para retomarlo en otro chat — reescribe la nota de trabajo del ticket, registra los hallazgos verificados y propone las decisiones tomadas en la sesión — y comprueba que la documentación sigue al código. Úsala antes de cerrar un chat con trabajo a medias o al terminar un ticket.
disable-model-invocation: true
argument-hint: "[ticket o rama]"
---

# Traspaso

Sigue la skill `core:memoria` y sus [formatos](../memoria/references/formatos.md). `<docs>` es la carpeta de documentación del `CLAUDE.md` (por defecto, `docs/`).

## Pasos

1. **Qué trabajo es**: `$ARGUMENTS` o la rama actual. La nota es `<docs>/notas/<ticket-o-rama>.md`.
2. **Recoge de la sesión**:
   - qué se hizo y qué falta;
   - el siguiente paso concreto;
   - ficheros sin commit (`git status --short`) y por qué;
   - preguntas abiertas.

   Recoge también:
   - **decisiones**: lo que el usuario decidió o eligió entre alternativas;
   - **hallazgos**: lo que costó averiguar o contradijo la documentación, con su evidencia.
3. **Hallazgos**: añádelos a `<docs>/hallazgos.md` (solo se añaden entradas) y dilo en el resumen.
4. **Decisiones**:
   - Busca primero en el índice si ya existen o si sustituyen a alguna.
   - Redáctalas con estado `propuesta`, con «Sustituye a» si aplica, y enséñaselas al usuario.
   - Al aceptarlas: estado `aceptada`, índice actualizado y, si sustituyen a otra, la vieja pasa a `sustituida por NNNN`.
5. **La documentación sigue al código**: comprueba si el trabajo de la sesión dejó desfasado algún documento (diagramas, glosario, `CLAUDE.md`, contexto, decisiones). Actualízalo o apúntalo como pendiente en la nota.
6. **Reescribe la nota entera**. Es el estado actual, no un diario. Si el ticket está cerrado, archívala (`notas/archivo/`) con un resumen de tres líneas.
7. **Resumen al usuario**:
   - nota actualizada;
   - hallazgos añadidos;
   - decisiones propuestas o aceptadas;
   - documentos actualizados o pendientes;
   - la frase exacta para retomar: `/core:retomar <ticket>`.

## Gotchas

- Si la carpeta de documentación está fuera de git, descartar código no revierte la nota: comprueba que la nota describe el código confirmado y no el descartado.
- Si el proyecto prohíbe mencionar herramientas de IA en lo que llega al repo y la documentación está dentro de git, nada de lo que escribas lo menciona.

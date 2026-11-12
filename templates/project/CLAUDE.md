# <Proyecto>

<!--
Plantilla del banco ai-bank. Se carga en CADA sesión y en cada subagente: mantenla corta (<200 líneas).
Solo lo que Claude no puede deducir leyendo el repo. Nada de describir la estructura de carpetas ni el stack evidente.
Lo que solo necesita un rol va en .claude/context/<agente>.md; el conocimiento extenso, en una skill del proyecto (.claude/skills/).
Borra estos comentarios y las secciones que no apliquen.
-->

<Una frase: qué es y para quién.>

## Comandos
<!-- Los que un agente necesita para comprobar su trabajo. Es la sección más útil de este fichero. -->
- Instalar: ``
- Tipos: ``
- Lint: ``
- Tests: ``
- Build: ``

## Reglas duras
<!-- Lo que no se hace nunca en este proyecto y por qué (en una línea). -->
- 

## Reglas sin excepción (candidatas a hook)
<!-- Las que no pueden fallar ni una vez. Cada una debería acabar en un hook o en permissions.deny de .claude/settings.json; aquí se listan mientras tanto. -->
- No leer `.env*` (ya está en permissions.deny).

## Git
<!-- Rama principal, convención de ramas y de mensajes de commit, y si Claude puede hacer commit/push sin preguntar. -->
- Rama principal: ``
- Commits: solo con aprobación explícita del usuario. Los subagentes nunca hacen commit.
- Formato del mensaje: ``
- Autoría: <!-- p. ej. «todo lo que llega al repo es del propietario: nunca mencionar herramientas de IA (ni trailers Co-Authored-By, ni notas, ni comentarios)», o lo contrario. -->

## Documentación
<!-- Carpeta de documentación del proyecto (<docs>). Por defecto docs/. Si está fuera de git a propósito, dilo: descartar código no la revierte. Formatos y reglas: skill core:memoria. -->
- Carpeta: `docs/` <!-- dentro | fuera de git -->
- Decisiones: `docs/decisiones/` (índice en `README.md`). Antes de proponer algo, comprueba las vigentes.
- Hallazgos verificados: `docs/hallazgos.md`. Léelos antes de fiarte de la documentación externa.
- Notas de trabajo: `docs/notas/<ticket>.md`. Al empezar, `/core:retomar`; al pausar, `/core:traspaso`.
- Glosario: `docs/GLOSSARY.md`. Planes: `docs/plans/`.
- La documentación se actualiza en el mismo paso que el código que describe.

## Idioma
<!-- Idioma de código, comentarios, commits y respuestas. -->

## Agentes del banco
Los agentes de `ai-bank` leen su contexto en `.claude/context/<agente>.md`, y las reglas de este fichero mandan sobre su método. Flujo de trabajo: skill `core:orquestacion`. Memoria: skill `core:memoria`. Al cerrar una feature: `/core:retro`.

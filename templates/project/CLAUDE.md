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

## Idioma
<!-- Idioma de código, comentarios, commits y respuestas. -->

## Agentes del banco
Los agentes de `ai-bank` leen su contexto en `.claude/context/<agente>.md`. Flujo de trabajo: skill `core:orquestacion`. Al cerrar una feature: `/core:retro`.

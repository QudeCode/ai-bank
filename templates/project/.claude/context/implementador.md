# Contexto · implementador

<!--
Contexto específico del proyecto para el agente implementador del banco ai-bank.
Solo lo que necesita este rol. Comandos y reglas duras viven en CLAUDE.md: enlaza, no copies.
Rellénalo con /core:init-context; lo amplían las «Propuestas para el contexto» de los agentes y /core:retro.
Borra las secciones que no apliquen. Debe caber en una o dos pantallas.
-->

## Apps y rutas
<!-- Dónde vive cada app o paquete (p. ej. backend en apps/backend, frontend en apps/frontend). -->

## Skills de stack que cargar
<!-- p. ej. backend → stack-nestjs:nestjs-backend (+ stack-nestjs:typeorm-datos si toca datos); frontend → stack-react:react-frontend; y skills del proyecto. -->

## Reutilizar antes de crear
<!-- Piezas comunes y dónde están: constantes, mapeo de errores, cliente HTTP, hooks, componentes, tokens CSS. -->

## No tocar
<!-- Ficheros que no se editan nunca (p. ej. bypass de autenticación de desarrollo, migraciones ya aplicadas, código generado). -->

## Cómo verificar lo que implementas
<!-- Si se verifica en una copia o sandbox, cómo sincronizar; qué subconjunto de comandos de CLAUDE.md ejecutar. -->

## Gotchas

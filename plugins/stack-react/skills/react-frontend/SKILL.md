---
name: react-frontend
description: Convenciones para implementar y revisar frontends React con Vite y CSS propio — organización del CSS por capas, nada de estilos estáticos inline, reutilizar componentes y controles existentes, coherencia visual entre vistas, estado y datos con hooks propios, y comprobación visual con Playwright y API simulada. Úsala antes de tocar o revisar vistas, componentes o estilos de un frontend React.
---

# Frontend React

El contexto del proyecto dice qué librerías se usan y cuáles están vetadas, los tokens y componentes CSS existentes, y cómo se verifica. **Si el proyecto contradice esta skill, manda el proyecto.**

## Antes de crear nada

- Busca con `Grep` si ya existe el mismo control o comportamiento en otra vista (desplegable, filtro, tabla, enlace, chip, modal, estado de carga o de error). **El mismo tipo de control se ve y se comporta igual en toda la app**: úsalo o amplíalo.
- Si algo ya está copiado en varios sitios, no añadas otra copia: dilo y propón extraerlo.
- No introduzcas librerías nuevas (UI, estado, animación, validación) sin que lo diga el plan.

## CSS

Organizado por capas e importado en orden desde un punto de entrada:

```
base/         variables (tokens: color, tipografía, radios, sombras), reset
layout/       contenedores del shell
components/   piezas reutilizables entre vistas
pages/        estilos propios de una sola vista
```

- Lo que se usa en varias vistas va a `components/`; lo de una sola vista, a `pages/<vista>`.
- **Nada de estilos inline para valores estáticos.** `style={{…}}` solo para valores dinámicos que vienen de datos.
- Nada de clases de utilidad sueltas tipo `mb-24` para arreglar un caso. El espaciado entre bloques de una vista, con `gap` en su contenedor.
- Modificadores con estilo BEM (`.bloque--modificador`). Los tokens salen de las variables, sin colores ni tamaños sueltos.
- Animaciones con `@keyframes` propios. Respeta `prefers-reduced-motion`.
- Alineación entre vistas: el shell aporta el padding común. El contenedor de una vista no añade su propio padding exterior, porque descuadra los títulos.
- El color de estado va solo en el elemento que lo representa (el icono o la etiqueta), no en todo el campo.

## Componentes y datos

- Un cliente HTTP compartido. Estado con hooks propios en su carpeta, salvo que el proyecto use otra cosa.
- Los valores cerrados que alimentan desplegables van en constantes, no escritos dentro del JSX.
- No mezcles en un fichero exportaciones de componentes con otras cosas (regla `react-refresh/only-export-components`).
- Accesibilidad básica: etiquetas en los formularios, botones de verdad para las acciones, foco visible. El detalle lo revisa `dev:revisor-ux`.
- Que siga funcionando en anchura de móvil.

## Verificación

- Tipos (`tsc`), lint de los ficheros cambiados y `build`.
- Para cambios visuales: un script de Playwright con la **API simulada** (rutas interceptadas) y capturas de los estados clave (vacío, cargando, error, con datos, móvil). El script se guarda fuera del repo salvo que el proyecto tenga carpeta de e2e.

## Gotchas

- Una clase con nombre de un dominio (`.factura-*`) reutilizada para otra cosa confunde: crea una neutra y que la usen las dos.
- Un `<select>` nativo donde la app usa un desplegable propio rompe la coherencia aunque «funcione».
- Las capturas con reloj simulado pueden ocultar transiciones. Para el estilo final, usa el reloj real.

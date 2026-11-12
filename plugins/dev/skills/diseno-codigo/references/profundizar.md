# Profundizar módulos y diseñar dos veces

## Clasifica las dependencias del candidato

La categoría decide cómo se prueba el módulo profundizado a través de su seam.

| Categoría | Ejemplo | Cómo se prueba |
|---|---|---|
| **En proceso** | Cálculo puro, estado en memoria | Fusiona y prueba por la nueva interfaz. Sin adaptador |
| **Sustituible en local** | Base de datos con un doble local (PGlite, SQLite en memoria), sistema de ficheros en memoria | El doble corre en los tests. El seam es interno, sin puerto en la interfaz |
| **Remota pero propia** | Servicios internos por red | Puerto en el seam. Adaptador HTTP o de cola en producción y en memoria en los tests |
| **Externa de verdad** | Pasarelas de pago, SMS, APIs de terceros | Puerto inyectado. Mock en los tests |

**Seams internos frente a externos:** un módulo profundo puede tener seams internos para sus propios tests. No los expongas en la interfaz solo porque los tests los usan.

## Diseñar dos veces

Para una interfaz cara de cambiar:

1. **Enmarca el problema**: restricciones que cualquier interfaz debe cumplir, dependencias con su categoría y un boceto de código para concretarlas. Es un boceto, no una propuesta.
2. **Genera 3-4 diseños radicalmente distintos**, en paralelo si se puede (subagentes o un workflow), cada uno con una restricción:
   - **Mínima**: 1-3 puntos de entrada, máxima palanca por punto.
   - **Flexible**: muchos casos de uso y extensión.
   - **Caso común**: el uso por defecto es trivial.
   - **Puertos y adaptadores**, si hay dependencias remotas o externas.

   Cada diseño incluye:
   - la interfaz (tipos, métodos, invariantes, orden, errores);
   - un ejemplo de uso;
   - qué oculta;
   - su estrategia de dependencias;
   - dónde la palanca es alta y dónde es débil.
3. **Compara** por profundidad, localidad y lugar del seam, y **recomienda uno** (o una mezcla). Hay que dar una opinión clara, no un menú.

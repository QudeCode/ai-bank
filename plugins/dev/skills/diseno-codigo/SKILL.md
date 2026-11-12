---
name: diseno-codigo
description: Vocabulario y criterios para diseñar y reestructurar código — módulos profundos, interfaz, seam, adaptador, test de borrado, diseñar dos veces, olores de código y refactor seguro en pasos pequeños. Úsala al diseñar la interfaz de un módulo, decidir dónde va un seam, evaluar si una abstracción se gana su sitio, hacer código más testeable o planificar un refactor. No es una guía de estilo ni de formato.
---

# Diseño de código

El objetivo es la **complejidad mínima necesaria**. Cada decisión se juzga así: ¿hace el sistema más fácil o más difícil de entender y de cambiar?

## Vocabulario (úsalo tal cual)

- **Módulo**: cualquier cosa con interfaz e implementación (función, clase, paquete, rebanada vertical).
- **Interfaz**: todo lo que quien lo llama debe saber para usarlo bien: la firma y también los invariantes, el orden de llamada, los modos de error, la configuración y el rendimiento.
- **Profundidad**: comportamiento por unidad de interfaz.
  - **Profundo**: mucho comportamiento detrás de una interfaz pequeña.
  - **Superficial**: interfaz casi tan compleja como la implementación.
- **Seam**: el lugar donde se puede cambiar comportamiento sin editar ese lugar; es donde vive la interfaz. Dónde ponerlo es una decisión en sí misma.
- **Adaptador**: lo concreto que satisface una interfaz en un seam.
- **Palanca** (para quien llama) y **localidad** (para quien mantiene): lo que da la profundidad. Se arregla una vez y queda arreglado en todas partes.

## Principios

- **Test de borrado**: imagina que borras el módulo.
  - Si la complejidad desaparece, era un pasamanos.
  - Si reaparece repartida entre quienes lo llaman, se ganaba el sitio.
- **La interfaz es la superficie de test.** Si para probarlo hay que atravesar la interfaz, el módulo tiene la forma equivocada.
- **Un adaptador es un seam hipotético; dos, uno real.** No crees un puerto si no varía nada a través de él (producción + test cuenta como dos).
- **Recibe dependencias, no las crees**, y **devuelve resultados en lugar de producir efectos** cuando puedas.
- **Oculta información**: lo que cambia junto, junto; lo que otro módulo no necesita saber, no se filtra por la interfaz (formatos, orden temporal, detalles de almacenamiento).
- **General en la interfaz, especial en la implementación**: una interfaz algo más general suele ser más simple que varias especiales.
- **Estratégico, no táctico**: arreglar el diseño en cuanto molesta es más barato que acumular parches. Pero nada de abstracciones especulativas: YAGNI.
- **Diseña dos veces**: la primera interfaz rara vez es la mejor. Para decisiones caras, esboza 2-3 interfaces radicalmente distintas (mínima, flexible, optimizada para el caso común) y compáralas por profundidad, localidad y lugar del seam. Ver [references/profundizar.md](references/profundizar.md).

## Señales de complejidad

- **Amplificación del cambio**: un cambio simple obliga a editar muchos sitios.
- **Carga cognitiva**: hay que tener demasiado en la cabeza para tocar algo.
- **Incógnitas desconocidas**: no es obvio qué hay que cambiar. Es la peor.
- **Banderas rojas**:
  - módulos superficiales y métodos pasamanos;
  - fuga de información entre módulos;
  - descomposición por orden temporal en lugar de por conocimiento;
  - parámetros que solo atraviesan capas;
  - nombres vagos;
  - comentarios que repiten el código;
  - duplicación.

## Refactor seguro

Refactorizar es cambiar la estructura **sin cambiar el comportamiento**.

1. Tests en verde antes de empezar. Si no los hay, escríbelos primero: nunca se refactoriza en rojo.
2. Nombra el olor que corriges y aplica su refactor:

   | Olor | Refactor |
   |---|---|
   | Método largo | Extraer función con un nombre que diga la intención |
   | Clase con varias razones para cambiar | Extraer clase |
   | Duplicación | Extraer y reutilizar |
   | Condicional por tipo repetido | Polimorfismo o tabla |
   | Envidia de datos | Mover la función junto a sus datos |
   | Lista larga de parámetros | Objeto de parámetros o mover la responsabilidad |

3. Un paso pequeño cada vez, de verde a verde. No mezcles un refactor con un cambio de comportamiento en el mismo paso.
4. Si el código no se lee mejor después del cambio, revierte.
5. Tras profundizar un módulo: escribe los tests en su nueva interfaz y borra los tests de los módulos superficiales que sustituye. Reemplaza los tests, no los apiles.

## Gotchas

- Un helper extraído «para poder testearlo» que deja los bugs en cómo se llama es una mala profundización: no hay localidad.
- Más ficheros y clases pequeñas no es mejor diseño. Mide por la interfaz, no por el tamaño.
- Si el proyecto tiene `GLOSSARY.md`, nombra los módulos con su vocabulario (skill `dev:modelo-dominio`).

Fuentes de las que se sintetiza: *A Philosophy of Software Design* (Ousterhout), *Refactoring* (Fowler), *Clean Code* (Martin), *Working Effectively with Legacy Code* (Feathers).

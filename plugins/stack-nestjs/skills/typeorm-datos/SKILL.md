---
name: typeorm-datos
description: Reglas para el modelo de datos con TypeORM y PostgreSQL — entidades, claves foráneas, restricciones, migraciones reversibles, seeders idempotentes y columnas desnormalizadas con un único dueño. Úsala antes de tocar o revisar entidades, migraciones, consultas complejas o datos semilla.
---

# Datos con TypeORM y PostgreSQL

El contexto del proyecto dice:
- dónde están las entidades, las migraciones y el seeder;
- el orden de dependencias;
- cómo se ejecutan las migraciones y la siembra.

## Modelo

- **Claves foráneas reales** (restricción en la base de datos) cuando las tablas comparten base. La integridad se impone en la base de datos, no solo en el código.
- Las reglas que PostgreSQL no expresa (p. ej. «como máximo N filas por padre») se imponen en el service, en una transacción.
- «Solo una fila activa por X», con un **índice único parcial** (`UNIQUE (x_id) WHERE released_at IS NULL`), no con comprobaciones en el código.
- Nombres de periodo coherentes (`assigned_at`/`released_at`…). No reutilices nombres que significan otra cosa en otra tabla.
- Si el proyecto tiene diagramas de diseño objetivo, el código converge hacia ellos. Las diferencias se señalan, no se ignoran.

## Migraciones

- Nunca edites una migración ya aplicada: crea otra.
- `up` conserva los datos. Piensa qué pasa con las filas existentes que no encajan en la restricción nueva.
- `down` es reversible de verdad. Comprueba `up → down → up` contra una base de desarrollo.
- Separa los cambios de esquema de las transformaciones de datos grandes cuando puedas.
- `synchronize: true` solo en desarrollo, si el proyecto lo usa. Nunca en producción.

## Columnas desnormalizadas

Una columna desnormalizada (p. ej. un «estado actual» copiado de un log) tiene **un único dueño** que la escribe y la mantiene en sincronía con la fuente. El resto del código la lee y nunca la persiste directamente: delega en el dueño.

## Seeders

- **Idempotentes**: se pueden volver a ejecutar sin duplicar.
  - **Upsert** (`INSERT … ON CONFLICT (id) DO UPDATE`) para entidades con ID estable.
  - **Borrar y volver a insertar** el conjunto afectado para entidades con ID generado.
- Orden de dependencias según las FK: un módulo no se siembra antes que sus referencias. El orden está en un solo sitio (orquestador más lista de módulos válidos).
- El seeder respeta a los dueños de las columnas desnormalizadas: quien no es dueño las excluye del `INSERT` y del `DO UPDATE`.
- Tras editar ficheros de semilla, valida que no queden referencias huérfanas y que se cumplan las restricciones únicas (p. ej. dos filas activas para la misma clave).

## Gotchas

- Un upsert que incluye una columna desnormalizada pisa lo que escribió su dueño en otra fase del seeder.
- En listas de IDs como texto, los ID numéricos con ceros a la izquierda (`033`) deben seguir siendo cadenas.
- `ON CONFLICT` necesita una restricción única que coincida exactamente con las columnas indicadas.

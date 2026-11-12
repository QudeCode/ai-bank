---
name: nestjs-backend
description: Convenciones para implementar y revisar backends NestJS — estructura de módulo (controller, service, repository, DTO), guards globales de autenticación y roles, validación de DTO, enums como objetos as const, documentación Swagger y lint estricto. Úsala antes de tocar o revisar código de un backend NestJS. Lo propio de cada proyecto (módulos, roles, decisiones) está en su .claude/context/.
---

# Backend NestJS

El contexto del proyecto (`.claude/context/implementador.md`, `revisor-codigo.md`) dice dónde está la app, qué módulos hay y qué decisiones propias aplican. **Si el proyecto contradice esta skill, manda el proyecto.**

## Estructura de un módulo

Una carpeta por módulo de dominio, con capas separadas:

```
<modulo>/
  <modulo>.module.ts
  controller/        controllers + controller/dto/ (DTO de entrada y salida)
  service/           lógica de negocio
  repository/        acceso a datos + repository/entity/
```

- El controller valida, delega y mapea. La lógica va en el service; las consultas, en el repository.
- Antes de crear un helper, mapper, constante o consulta, busca uno en `common/` o en módulos hermanos.
- Las dependencias entre módulos, por import explícito del módulo y sus providers exportados. Nada de acceder al repository de otro módulo.

## Seguridad

- Guards globales (`APP_GUARD`). **El orden importa**: primero autenticación (p. ej. `JwtAuthGuard`) y después autorización (`RolesGuard`), que depende del `request.user` que rellena el primero.
- Las rutas públicas se marcan explícitamente (`@Public()` o equivalente). Por defecto todo está protegido.
- Autorización por rol con decorador + `Reflector` (`@Roles(...)`). Comprueba siempre en el servidor, nunca solo en el frontend.
- No leas la identidad de cabeceras que el cliente puede falsificar: sale del token verificado.

## Validación

- `ValidationPipe` global con `whitelist: true` (descarta propiedades no declaradas) y `transform: true`.
- Cada campo del DTO, con su decorador de `class-validator`. Los DTO de salida no exponen campos internos.

## Valores cerrados

En lugar de `enum` de TypeScript, objeto `as const` + tipo unión derivado, en una carpeta común de constantes:

```ts
export const ESTADO = { ACTIVO: 'active', INACTIVO: 'inactive' } as const;
export type Estado = (typeof ESTADO)[keyof typeof ESTADO];
```

Las columnas se tipan con el tipo derivado, y su `default` referencia la constante, nunca un literal suelto.

## API

- Swagger solo fuera de producción (`if (process.env.NODE_ENV !== 'production')`).
- Controllers y DTO anotados (`@ApiTags`, `@ApiBearerAuth`, `@ApiOperation`, `@ApiProperty`).
- Un cambio de contrato se refleja en los tipos del frontend en el mismo cambio, o se señala como contrato pendiente.

## Calidad

- `typescript-eslint` estricto. El prefijo `_` es para lo que se deja sin usar a propósito.
- Sin promesas flotantes: `await` o `void` explícito.
- Tests unitarios del service para la lógica nueva.
- Comentarios solo para el «por qué» no obvio. Sin abstracciones especulativas.

## Gotchas

- Registrar `RolesGuard` antes que el de autenticación hace que `request.user` llegue vacío y que **todo** falle como 403.
- Con `whitelist: true`, una propiedad sin decorador desaparece en silencio: si un campo «no llega», revisa el DTO.
- Para datos y migraciones, carga `stack-nestjs:typeorm-datos`.

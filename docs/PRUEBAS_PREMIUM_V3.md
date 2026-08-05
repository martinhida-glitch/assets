# Pruebas de Premium V3

## Código

- Transpilación sintáctica de 40 archivos `.ts`/`.tsx`: aprobada.
- Resolución de 78 imports locales: aprobada.
- Typecheck estricto con stubs temporales para dependencias externas: aprobado.
- Escaneo de secretos: sin JWT privados, service-role ni claves privadas.
- Escaneo de nombres ajenos: sin referencias activas a otros proyectos.

## Supabase

- `record_ad_event`: prueba transaccional reversible aprobada.
- Dos impresiones consecutivas con la misma sesión produjeron un solo evento.
- Un clic produjo un evento independiente.
- La campaña y el comercio temporales fueron revertidos.

## Limitación

El entorno de ejecución no pudo resolver `registry.npmjs.org` (`EAI_AGAIN`). No se afirma que `next build` haya pasado todavía. El workflow de GitHub debe ejecutar la validación real antes de publicar.

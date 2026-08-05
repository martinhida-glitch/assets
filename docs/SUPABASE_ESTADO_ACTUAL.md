# Supabase — estado actual de ALTOQUE

Proyecto: `kjtxkdztssbymtloafrb`.

La base productiva es la fuente de verdad. Incluye perfiles privados y públicos, categorías, publicaciones, fotos, propuestas, muro, comercios, campañas y métricas publicitarias.

## Último cambio funcional

`altoque_record_ad_events_v027` incorpora el RPC público controlado `record_ad_event`:

- admite `impression`, `click` y `whatsapp`;
- valida que la campaña y el comercio estén activos;
- almacena un hash anónimo, no el identificador local en claro;
- deduplica impresiones durante 30 minutos;
- no concede acceso directo de escritura a `ad_events`.

El conector registró el mismo nombre de migración varias veces por reintentos idempotentes. Esto no duplicó funciones ni índices y no se modificó manualmente el historial.

## Pruebas

La prueba transaccional reversible creó un comercio y una campaña temporales, llamó dos veces a `impression` y una vez a `click`, confirmó un solo registro de impresión y uno de clic, y ejecutó `ROLLBACK`.

## Avisos conocidos del asesor

- `accept_proposal`: SECURITY DEFINER intencional para una aceptación atómica y autorizada.
- `record_ad_event`: SECURITY DEFINER intencional para registrar métricas públicas sin conceder INSERT sobre la tabla.
- Protección de contraseñas filtradas: debe activarse manualmente desde Auth.
- Índices sin uso: esperables mientras no exista tráfico suficiente.

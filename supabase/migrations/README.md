# Migraciones versionadas

La base productiva de Supabase es actualmente la fuente de verdad. No reconstruirla ejecutando los SQL de `archive/sql_legacy`.

Esta carpeta contiene únicamente cambios nuevos conservados desde la consolidación del proyecto Next.js. La migración V027 ya fue aplicada mediante el conector de Supabase y se incluye para trazabilidad.

Los registros repetidos con el nombre `altoque_record_ad_events_v027` en el historial productivo corresponden a reintentos idempotentes del conector. La función y el índice finales existen una sola vez y pasaron la prueba transaccional reversible.

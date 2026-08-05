# Seguridad

- Nunca agregar `service_role`, claves secretas ni contraseñas de base al frontend.
- `.env.local` está ignorado y no forma parte de esta entrega.
- La publishable key puede usarse en el navegador únicamente junto con RLS correcto.
- No ejecutar los SQL históricos sobre producción.
- La base Supabase actual es la fuente de verdad hasta generar una migración consolidada.

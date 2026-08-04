# ALTOQUE — aplicación oficial premium

Marketplace local de necesidades, servicios, recados, changas y empleo, conectado al proyecto Supabase real de ALTOQUE.

## Funciones

- Registro, confirmación de correo, ingreso y recuperación de contraseña.
- Perfil único con avatar, experiencia, disponibilidad y CV privado.
- Publicación de servicios, recados, changas y vacantes.
- Fotos, presupuesto, urgencia, horario y vencimiento.
- Muro de oportunidades tipo notas adhesivas.
- Búsqueda por texto y categoría.
- Propuestas, aceptación atómica y seguimiento de actividad.
- Publicidad contextual para comercios, oculta cuando no hay campañas activas.
- PWA con caché limitada a recursos públicos seguros.
- Identidad premium negra, celeste/azul neón y dorada.

## Inicio local

```bash
cp .env.example .env.local
npm ci
npm run dev
```

## Validación

```bash
npm run typecheck
npm run lint
npm run build
```

O todo junto:

```bash
npm run check
```

## Seguridad

- No agregar claves service-role al frontend.
- `.env.local` está ignorado por Git.
- No ejecutar los SQL de `archive/sql_legacy/`; son únicamente históricos.
- Los enlaces patrocinados solo aceptan HTTP/HTTPS.
- Las redirecciones de confirmación solo aceptan rutas internas.

Ver `docs/DEPLOY.md` para publicación y `docs/design_reference/README.md` para la identidad visual.


## Rama de validación

La rama `altoque-app-v3` se usa para validar CI de forma aislada hasta trasladar el código al repositorio exclusivo `altoque-app`.

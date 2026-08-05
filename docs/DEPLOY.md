# Publicación de ALTOQUE

## 1. Repositorio

Crear un repositorio vacío y exclusivo llamado `altoque-app`. Subir el contenido de esta carpeta a la rama `main`.

## 2. Variables

Configurar estas variables en el servicio de despliegue:

```text
NEXT_PUBLIC_SUPABASE_URL=https://kjtxkdztssbymtloafrb.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ZpsIy7fSJK8Ucz6r2DwfZw_UN40LxPR
NEXT_PUBLIC_SITE_URL=https://URL-DEFINITIVA
```

La publishable key es pública por diseño. Nunca agregar una service-role key al frontend ni al repositorio.

## 3. Validación

```bash
npm ci
npm run check
```

El workflow `.github/workflows/ci.yml` repite estas comprobaciones en cada cambio.

## 4. Supabase Auth

Cuando exista la URL definitiva:

- colocarla como Site URL;
- agregarla a Redirect URLs;
- mantener `/auth/confirm` como destino de confirmación y recuperación.

## 5. Comprobación manual

1. Crear una cuenta.
2. Confirmar correo o ingresar directamente según la configuración de Auth.
3. Completar perfil y cargar avatar.
4. Publicar una necesidad con vencimiento en el muro.
5. Crear una segunda cuenta y enviar una propuesta.
6. Aceptarla desde la cuenta autora.
7. Probar recuperación de contraseña.

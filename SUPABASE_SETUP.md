# Supabase Setup

## 1. Crear proyecto

1. Entra a [Supabase](https://supabase.com/).
2. Crea un proyecto nuevo.
3. Espera a que termine la provision.

## 2. Crear tabla de progreso

1. Abre el editor SQL del proyecto.
2. Pega el contenido de [supabase/user_progress.sql](/C:/Users/Usuario/OneDrive/Documentos/paginadearte/supabase/user_progress.sql).
3. Ejecuta el script.

## 3. Activar Google login

1. Ve a `Authentication`.
2. Entra a `Providers`.
3. Activa `Google`.
4. Completa el `Client ID` y `Client Secret` de Google Cloud.
5. Agrega la redirect URL de Expo/Supabase que te muestre el panel.

## 4. Variables del proyecto

1. Copia [.env.example](/C:/Users/Usuario/OneDrive/Documentos/paginadearte/.env.example) a un archivo `.env`.
2. Rellena:

```env
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=TU-ANON-KEY
```

## 5. Redirect para la app

La app ya usa este callback:

```txt
kuroclean://auth/callback
```

## 6. Que guarda por usuario

- tareas diarias, semanales, mensuales y anuales
- monedas y corazones
- compras
- tema equipado
- iconos equipados
- ajustes
- progreso de minijuegos

## 7. Migracion

Cuando alguien ya tenga progreso local y luego inicie sesion, el estado local se sube a la nube si es mas nuevo.

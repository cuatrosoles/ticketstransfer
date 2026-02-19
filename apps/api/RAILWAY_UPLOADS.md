# Uploads persistentes en Railway

Railway usa un sistema de archivos **efímero**: los archivos subidos se pierden en cada despliegue. Para que las fotos de perfil y otros uploads persistan, debés configurar un **Volume**.

## Pasos

1. **Crear un Volume** en tu proyecto Railway:
   - En el dashboard de Railway, abrí tu servicio
   - Clic en el servicio → **Variables** o **Settings**
   - Buscá **Volumes** o añadí un Volume desde el panel

2. **Montar el Volume** en `/app/uploads`:
   - Al crear el Volume, configurá el **Mount Path** como `/app/uploads`

3. **Variable de entorno** (opcional):
   - Añadí `UPLOADS_PATH=/app/uploads` en las variables de Railway
   - O el sistema usará `RAILWAY_VOLUME_MOUNT_PATH` si Railway lo define automáticamente

4. **APP_URL** (obligatorio):
   - Asegurate de tener `APP_URL` con la URL pública de tu API (ej: `https://tu-api.railway.app`)
   - Las URLs de las imágenes se generan como `{APP_URL}/uploads/{filename}`

## Verificación

Tras desplegar, subí una foto de perfil. Si el Volume está bien configurado, la imagen persistirá entre despliegues y podrás verla en la app.

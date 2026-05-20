# Integración Mercado Pago - Tickets Transfer

Checkout Pro para pagos seguros con escrow (reténción hasta confirmar transferencia del ticket).

## Configuración en Mercado Pago

### 1. Crear aplicación

1. En [Tus integraciones](https://www.mercadopago.com.ar/developers/panel/app) → Crear aplicación.
2. Nombre: Tickets Transfer (o el que prefieras).

### 2. Credenciales

1. En la app → Credenciales.
2. **Modo prueba**: Usa credenciales de prueba para desarrollo.
3. **Modo producción**: Usa credenciales de producción para cobros reales.
4. Copia el **Access Token** (producción o prueba).

### 3. Webhooks

1. En la app → Webhooks → Configurar notificaciones.
2. **URL producción**: `https://tu-api.com/api/webhooks/mercadopago`
3. **URL pruebas**: `https://tu-api.com/api/webhooks/mercadopago` (o ngrok para local).
4. Eventos: **Pagos** (topic: `payment`).
5. Guardar y copiar la **Clave secreta** generada.

### 4. Configuración

**Opción A – Panel de Administración (recomendado)**

1. Admin → Configuración → Pasarelas de pago.
2. Activar Mercado Pago.
3. Ingresar Access Token y Webhook Secret.
4. **Desactivar "Modo Sandbox"** y guardar (obligatorio para cobros reales).
5. Usar **credenciales de producción** (Access Token y Public Key de producción en el panel de MP).

**Opción B – Variables de entorno**

En `apps/api/.env`:

```bash
MERCADOPAGO_ACCESS_TOKEN="APP_USR-xxxxxxxx"
MERCADOPAGO_WEBHOOK_SECRET="tu-clave-secreta-del-webhook"
WEB_URL="https://tu-web.com"   # Para URLs de retorno tras el pago
```

## Flujo de pago

1. **Comprador** crea orden → API crea preferencia Mercado Pago → devuelve `checkoutUrl`.
2. **Comprador** hace clic en "Pagar con Mercado Pago" → se abre el checkout de MP.
3. **Comprador** paga en Mercado Pago (tarjeta, cuenta MP, etc.).
4. **Mercado Pago** envía webhook a nuestra API → actualizamos orden a `ESPERANDO_TRANSFERENCIA`.
5. **Comprador** vuelve a la app (URL de retorno) → ve "Pago recibido, esperando transferencia".
6. **Vendedor** transfiere el ticket → comprador confirma → se libera el pago.

## Pruebas locales

1. Usar ngrok para exponer el webhook: `ngrok http 3001`
2. En Mercado Pago → Webhooks → URL de pruebas: `https://xxx.ngrok.io/api/webhooks/mercadopago`
3. Usar credenciales de **prueba** en `MERCADOPAGO_ACCESS_TOKEN`.
4. Usar tarjetas de prueba de [Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/test/accounts).

## Solo app móvil (sin web pública)

Si solo tenés app Android/iOS:

1. **Admin** → Configuración → Pasarelas de pago.
2. En **URL de retorno**, ingresá: `ticketTransfer://`
3. Guardar.

Tras el pago en Mercado Pago, el usuario será redirigido a la app mediante deep link (`ticketTransfer://orden/{orderId}/pago?status=success`). La app ya está configurada para manejar este esquema en Android e iOS.

## Producción (con web)

- Poné la URL pública de tu web (ej: `https://ticketstransfer.com`) en **URL de retorno**.
- Las URLs de retorno serán `{URL}/orden/{orderId}/pago?status=success|failure|pending`.
- El webhook debe ser accesible desde internet (HTTPS).

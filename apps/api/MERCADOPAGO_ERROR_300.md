# Solución al error 300 "Unauthorized use of live credentials" de Mercado Pago

Este documento describe pasos para resolver el error 300 cuando se usan credenciales de prueba en modo sandbox.

## Cambios implementados

1. **Email @testuser.com en sandbox**: Cuando `sandboxMode` está activo, las llamadas a Mercado Pago usan emails de test (`test_<userId>@testuser.com`) en lugar del email real del usuario, tanto para Customers como para Payments y Preferences.

2. **Opción "Usar payer@test.com"**: Si el error aparece **al agregar tarjeta**, activá en Admin → Configuración → Pasarelas la opción **"Usar payer@test.com en sandbox"**. El token del formulario se genera con ese email; el customer en MP debe usar el mismo para que coincidan.

## Verificación de credenciales

El error 300 suele indicar **mezcla de credenciales** (producción vs prueba). Verificá:

1. **Credenciales de prueba**: En [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/app) → Tu aplicación → **Credenciales de prueba** (o "Test credentials"). Copiá el Access Token y Public Key de esa sección, NO de "Credenciales de producción".

2. **Variables de entorno**: Si la API está en Railway u otro host, **eliminá** `MERCADOPAGO_ACCESS_TOKEN` y `MERCADOPAGO_PUBLIC_KEY` de las variables de entorno. La API usa Firestore cuando `mercadopago.enabled` está activo; si hay variables de entorno con credenciales de producción, podrían tener prioridad en algunos casos.

3. **Public Key y Access Token del mismo tipo**: Ambos deben ser de prueba o ambos de producción. Si el frontend usa Public Key de prueba para generar el token, el backend debe usar Access Token de prueba.

## Orden de pruebas

1. Con `sandboxMode: true` y `sandboxUsePayerTestCom: false` (por defecto): usa `test_xxx@testuser.com`.
2. Si falla, activá `sandboxUsePayerTestCom: true` en Admin.
3. Verificá que las credenciales en Firestore sean las de **prueba** del panel de MP.
4. Invalidá caché: la API cachea settings 30 segundos. Tras cambiar Firestore, esperá o reiniciá la API.

## Firestore: platformSettings/main

Estructura esperada:

```json
{
  "mercadopago": {
    "enabled": true,
    "accessToken": "APP_USR-xxx...",
    "publicKey": "APP_USR-xxx...",
    "sandboxMode": true,
    "sandboxUsePayerTestCom": false
  }
}
```

Las credenciales deben venir de **Credenciales de prueba** en el panel de Mercado Pago.

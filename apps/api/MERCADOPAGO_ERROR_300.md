# Solución al error 300 "Unauthorized use of live credentials" de Mercado Pago

Este documento describe pasos para resolver el error 300 cuando se usan credenciales de prueba en modo sandbox.

## Workaround que SÍ funciona

**"No guardar tarjetas en sandbox"**: En Admin → Configuración → Pasarelas, activá **"No guardar tarjetas en sandbox (evita error 300)"**. Con esto:
- No se llama a Mercado Pago al agregar tarjetas → no hay error 300
- Podés probar el flujo de pago ingresando la tarjeta al momento de comprar (Checkout o formulario de pago)
- Las tarjetas no se guardan; es solo para pruebas

## Otras opciones (si el workaround no aplica)

1. **Email @testuser.com en sandbox**: Cuando `sandboxMode` está activo, se usan emails de test (`test_<userId>@testuser.com`).

2. **Opción "Usar payer@test.com"**: Si el error aparece al agregar tarjeta, activá **"Usar payer@test.com en sandbox"**.

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

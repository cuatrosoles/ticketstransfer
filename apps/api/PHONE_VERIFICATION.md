# Verificación de teléfono con Twilio

Guía para enviar códigos de verificación por SMS en producción usando [Twilio](https://www.twilio.com).

---

## Comportamiento

| Configuración | Modo | Comportamiento |
|---------------|------|----------------|
| **Sin Twilio** (dev) | Desarrollo | El código se muestra en los logs de la API. No se envía SMS. |
| **Con Twilio** (prod) | Producción | El código se envía por SMS al teléfono del usuario. |
| **Sin Twilio** (prod) | Error | La API devuelve error: "SMS no configurado". |

---

## Paso 1: Crear cuenta en Twilio

1. Entrá a [twilio.com](https://www.twilio.com) y creá una cuenta.
2. En el [Console](https://console.twilio.com), copiá:
   - **Account SID** (empieza con `AC...`)
   - **Auth Token** (clic en "Show" para verlo)

---

## Paso 2: Obtener número de teléfono

1. En Twilio Console → **Phone Numbers** → **Manage** → **Buy a number**.
2. Elegí un número con capacidad de SMS (la mayoría los tienen).
3. Para Argentina: Twilio tiene números en varios países. Podés usar un número de EE.UU. para enviar SMS a Argentina (funciona correctamente).
4. Copiá el número en formato E.164 (ej: `+14155238886`).

---

## Paso 3: Configurar en Railway

En las variables de entorno del servicio API:

| Variable | Valor |
|----------|-------|
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxx...` (Account SID) |
| `TWILIO_AUTH_TOKEN` | Tu Auth Token |
| `TWILIO_PHONE_NUMBER` | `+14155238886` (tu número Twilio en E.164) |

---

## Paso 4: Redeploy

1. Guardá las variables en Railway.
2. Hacé redeploy del servicio API.
3. Probá la verificación de teléfono desde la app móvil.

---

## Formato del teléfono

La app acepta números en varios formatos. Se normalizan automáticamente a E.164:
- `02966 485939` → `+5492966485939`
- `+54 9 2966 485939` → `+5492966485939`
- `5492966485939` → `+5492966485939`

---

## Cuenta de prueba (Trial)

Con una cuenta de prueba, Twilio solo permite enviar SMS a números verificados. Para producción necesitás activar la cuenta (agregar método de pago). Los precios por SMS varían según el país de destino.

---

## Resolución de problemas

### Error: "SMS no configurado"
- Verificá que las 3 variables estén configuradas en Railway.
- Hacé redeploy después de agregarlas.

### Error: "Error al enviar el SMS"
- Revisá los logs de la API para ver el mensaje de Twilio.
- Verificá que el número Twilio tenga capacidad de SMS.
- En cuenta trial: solo podés enviar a números verificados en Twilio.

### El SMS no llega
- Revisá que el número de destino esté en formato correcto.
- Algunos operadores pueden demorar la entrega.
- Verificá en Twilio Console → Logs que el mensaje se haya enviado.

---

## Referencias

- [Twilio SMS Quickstart](https://www.twilio.com/docs/sms/quickstart/node)
- [Twilio Pricing](https://www.twilio.com/sms/pricing)

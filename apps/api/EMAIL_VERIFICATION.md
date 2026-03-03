# Verificación de email con Resend

Guía para enviar códigos de verificación de email en producción usando [Resend](https://resend.com).

---

## Plan gratuito

- **100 emails/día** sin costo
- 1 dominio personalizado
- API REST y SDK oficial
- Sin tarjeta de crédito para empezar

---

## Paso 1: Crear cuenta en Resend

1. Entrá a [resend.com](https://resend.com) y hacé clic en **Sign up**.
2. Registrate con tu email o GitHub.

---

## Paso 2: Obtener API Key

1. En el dashboard de Resend, andá a **API Keys**.
2. Clic en **Create API Key**.
3. Elegí un nombre (ej: `Tickets Transfer API`).
4. Copiá la clave que empieza con `re_...` (solo se muestra una vez).

---

## Paso 3: Configurar en Railway (o tu hosting)

En las variables de entorno del servicio API:

| Variable | Valor |
|----------|-------|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxxxxx` (la clave que copiaste) |

---

## Paso 4: Dominio para producción

### Opción A: Pruebas (solo desarrollo)

- **Sin** configurar dominio: Resend usa `onboarding@resend.dev` como remitente.
- Funciona para probar en local o staging.
- **Limitación**: En producción, algunos proveedores pueden marcar estos emails como spam.

### Opción B: Producción (recomendado)

1. En Resend, andá a **Domains**.
2. Clic en **Add Domain**.
3. Ingresá tu dominio (ej: `ticketstransfer.com`).
4. Resend te dará registros DNS (SPF, DKIM). Agregalos en tu proveedor de DNS (Cloudflare, GoDaddy, etc.).
5. Esperá a que el dominio esté verificado (verde).
6. Agregá la variable de entorno:

```
EMAIL_FROM_VERIFICATION="Tickets Transfer <noreply@tudominio.com>"
```

---

## Paso 5: Verificar en Railway

1. Guardá las variables en Railway.
2. Hacé redeploy del servicio API.
3. Probá el registro en la app móvil: el código debería llegar a tu email.

---

## Comportamiento

| `RESEND_API_KEY` | Comportamiento |
|------------------|----------------|
| **No configurado** | El código se guarda en Firestore y se muestra en los logs de la API (console). Útil para desarrollo local. |
| **Configurado** | El código se envía por email al usuario. |

---

## Resolución de problemas

### Error: "Error al enviar el email"
- Verificá que `RESEND_API_KEY` esté correcta.
- Revisá los logs de la API para ver el mensaje de error de Resend.
- Si usás dominio propio, asegurate de que esté verificado.

### El email no llega
- Revisá la carpeta de spam.
- Con `onboarding@resend.dev`, la entrega puede ser menos confiable en producción.
- Verificá el dominio en Resend para mejorar la entrega.

### Límite de 100 emails/día
- Si superás el límite, Resend devolverá error. Para más volumen, considerá el plan Pro.

---

## Referencias

- [Resend Docs](https://resend.com/docs)
- [Resend Node.js SDK](https://resend.com/docs/send-with-nodejs)
- [Resend Pricing](https://resend.com/pricing)

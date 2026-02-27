# Migración de base de datos – Neon + Railway

Tu base de datos está en **Neon.tech** y la API en **Railway**. Para aplicar las migraciones:

## 1. Configurar DATABASE_URL

En tu máquina local, creá o editá `apps/api/.env` con la URL de Neon:

```env
DATABASE_URL="postgresql://neondb_owner:TU_PASSWORD@ep-broad-recipe-aion96f6-pooler.c-4.us-east-1.aws.neon.tech/ticketstransfer?sslmode=require"
```

Obtené la URL completa desde [Neon Console](https://console.neon.tech/app/projects/sweet-surf-24232469?database=ticketstransfer) → Connection string.

> **Importante:** No subas `.env` a Git. Railway ya tiene su propia `DATABASE_URL` en Variables de entorno (copiada desde Neon).

---

## 2. Si aparece el error P3005 (schema not empty)

Ese error indica que la base ya tiene tablas pero Prisma no tiene historial de migraciones. Hay que hacer un **baseline**: marcar las migraciones existentes como aplicadas y luego aplicar solo la nueva.

Ejecutá en orden:

```bash
cd v2/apps/api

# Marcar las 3 migraciones ya aplicadas (schema actual)
npx prisma migrate resolve --applied "0_init_baseline"
npx prisma migrate resolve --applied "20250219000000_add_username_numero_id_ticket_fields"
npx prisma migrate resolve --applied "20250219100000_add_messaging"

# Aplicar la migración nueva
npx prisma migrate deploy
```

---

## 3. Si no tenés el error P3005

```bash
cd v2/apps/api
npx prisma migrate deploy
```

---

## 4. Regenerar el cliente Prisma (opcional)

Si modificaste el schema:

```bash
npx prisma generate
```

---

## 5. Railway

Railway usa la misma `DATABASE_URL` que configuraste en el proyecto. Tras cada deploy, la API usa el esquema actualizado. No hace falta ejecutar migraciones dentro de Railway si ya las corriste contra la misma base de Neon.

---

## Si una migración falló (P3018)

Marcala como revertida y volvé a intentar:

```bash
npx prisma migrate resolve --rolled-back "20250226000000_add_phone_verification_quantity_order_rating"
npx prisma migrate deploy
```

---

## Si `prisma migrate deploy` hace segmentation fault

Aplicá la migración manualmente con `psql` y luego marcala como aplicada:

```bash
cd v2/apps/api

# Ejecutar el SQL directamente (reemplazá la URL por tu connection string de Neon)
psql 'postgresql://neondb_owner:TU_PASSWORD@ep-broad-recipe-aion96f6-pooler.c-4.us-east-1.aws.neon.tech/ticketstransfer?sslmode=require' -f prisma/migrations/20250226000000_add_phone_verification_quantity_order_rating/migration.sql

# Marcar la migración como aplicada para que Prisma la reconozca
npx prisma migrate resolve --applied "20250226000000_add_phone_verification_quantity_order_rating"
```

Si no tenés `psql` instalado, copiá y pegá este SQL en la [consola de Neon](https://console.neon.tech) → SQL Editor:

```sql
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone_verification_code" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone_verification_expires" TIMESTAMP(3);
ALTER TABLE "TicketListing" ADD COLUMN IF NOT EXISTS "quantity_entries" TEXT;
CREATE TABLE "order_ratings" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "rater_id" TEXT NOT NULL,
    "rated_user_id" TEXT NOT NULL,
    "positive" BOOLEAN NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_ratings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "order_ratings_order_id_rater_id_key" ON "order_ratings"("order_id", "rater_id");
```

Luego ejecutá `npx prisma migrate resolve --applied "20250226000000_add_phone_verification_quantity_order_rating"` para que Prisma registre la migración.

---

## Migraciones incluidas

- `0_init_baseline`: baseline inicial
- `20250219000000_add_username_numero_id_ticket_fields`: username, numeroId, campos de ticket
- `20250219100000_add_messaging`: mensajería
- `20250226000000_add_phone_verification_quantity_order_rating`: verificación de teléfono, cantidad de entradas, tabla de ratings

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "numero_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "User_numero_id_key" ON "User"("numero_id");

-- AlterTable TicketListing
ALTER TABLE "TicketListing" ADD COLUMN IF NOT EXISTS "publication_password" TEXT;
ALTER TABLE "TicketListing" ADD COLUMN IF NOT EXISTS "ticketera_otra" TEXT;
ALTER TABLE "TicketListing" ADD COLUMN IF NOT EXISTS "app_boletos_otra" TEXT;
ALTER TABLE "TicketListing" ADD COLUMN IF NOT EXISTS "tipo_entrada_otro" TEXT;

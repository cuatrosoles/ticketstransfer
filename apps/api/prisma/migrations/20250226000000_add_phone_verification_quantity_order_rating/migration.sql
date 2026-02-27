-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone_verification_code" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone_verification_expires" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TicketListing" ADD COLUMN IF NOT EXISTS "quantity_entries" TEXT;

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "order_ratings_order_id_rater_id_key" ON "order_ratings"("order_id", "rater_id");

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "batch_id" TEXT,
ADD COLUMN     "is_batch_master" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payment_id" TEXT;

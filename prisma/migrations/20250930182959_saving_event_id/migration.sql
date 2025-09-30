/*
  Warnings:

  - You are about to drop the column `paymentStatus` on the `bookings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "paymentStatus",
ADD COLUMN     "googleEventId" TEXT;

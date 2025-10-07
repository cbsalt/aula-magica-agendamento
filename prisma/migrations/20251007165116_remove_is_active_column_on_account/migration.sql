/*
  Warnings:

  - You are about to drop the column `is_active` on the `payment_configs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payment_configs" DROP COLUMN "is_active";

/*
  Warnings:

  - A unique constraint covering the columns `[public_link]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "teachers" ADD COLUMN "public_link" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "teachers_public_link_key" ON "teachers"("public_link");

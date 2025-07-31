/*
  Warnings:

  - You are about to drop the column `zoomEmail` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `zoomPassword` on the `teachers` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_teachers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT,
    "description" TEXT,
    "price" REAL NOT NULL DEFAULT 150,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "googleAccessToken" TEXT,
    "googleRefreshToken" TEXT,
    "googleCalendarId" TEXT,
    "zoomAccessToken" TEXT,
    "zoomRefreshToken" TEXT,
    "has_public_link" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_teachers" ("createdAt", "currency", "description", "email", "googleAccessToken", "googleCalendarId", "googleRefreshToken", "has_public_link", "id", "isActive", "name", "photo", "price", "slug", "updatedAt", "zoomAccessToken", "zoomRefreshToken") SELECT "createdAt", "currency", "description", "email", "googleAccessToken", "googleCalendarId", "googleRefreshToken", "has_public_link", "id", "isActive", "name", "photo", "price", "slug", "updatedAt", "zoomAccessToken", "zoomRefreshToken" FROM "teachers";
DROP TABLE "teachers";
ALTER TABLE "new_teachers" RENAME TO "teachers";
CREATE UNIQUE INDEX "teachers_email_key" ON "teachers"("email");
CREATE UNIQUE INDEX "teachers_slug_key" ON "teachers"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

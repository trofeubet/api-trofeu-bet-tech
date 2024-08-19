/*
  Warnings:

  - You are about to drop the column `id_plataforma` on the `players` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_platform]` on the table `players` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_platform` to the `players` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "players_id_plataforma_key";

-- AlterTable
ALTER TABLE "players" DROP COLUMN "id_plataforma",
ADD COLUMN     "id_platform" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "players_id_platform_key" ON "players"("id_platform");

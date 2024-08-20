/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `players` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "players" ADD COLUMN     "cpf" TEXT;

-- CreateTable
CREATE TABLE "Deposits_month" (
    "id" TEXT NOT NULL,
    "id_player" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "date_deposits" TIMESTAMP(3),
    "valor_total_deposit" DOUBLE PRECISION NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deposits_month_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_cpf_key" ON "players"("cpf");

-- AddForeignKey
ALTER TABLE "Deposits_month" ADD CONSTRAINT "Deposits_month_id_player_fkey" FOREIGN KEY ("id_player") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

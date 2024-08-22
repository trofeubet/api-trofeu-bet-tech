/*
  Warnings:

  - You are about to drop the `Deposits_month` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Transactions" AS ENUM ('DEPOSIT', 'WITHDRAWAL');

-- DropForeignKey
ALTER TABLE "Deposits_month" DROP CONSTRAINT "Deposits_month_id_player_fkey";

-- DropTable
DROP TABLE "Deposits_month";

-- CreateTable
CREATE TABLE "Transactions_month" (
    "id" TEXT NOT NULL,
    "id_player" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "date_transactions" TIMESTAMP(3),
    "type_transactions" "Transactions" NOT NULL,
    "valor_total_transactions" DOUBLE PRECISION NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transactions_month_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transactions_month" ADD CONSTRAINT "Transactions_month_id_player_fkey" FOREIGN KEY ("id_player") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

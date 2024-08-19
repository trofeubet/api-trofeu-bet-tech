-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Sectores" AS ENUM ('RISCO', 'FINANCEIRO', 'AFILIADOS', 'GERENCIAL', 'TRAFEGO', 'USER', 'DESENVOLVIMENTO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'INACTIVE',
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sector" "Sectores" NOT NULL DEFAULT 'USER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "id_plataforma" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "tell" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL,
    "date_birth" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "id_player" TEXT NOT NULL,
    "ftd_value" DOUBLE PRECISION NOT NULL,
    "ftd_date" TIMESTAMP(3) NOT NULL,
    "qtd_deposits" INTEGER NOT NULL,
    "total_deposit_amount" DOUBLE PRECISION NOT NULL,
    "total_withdrawals" DOUBLE PRECISION NOT NULL,
    "qtd_withdrawals" INTEGER NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "players_id_plataforma_key" ON "players"("id_plataforma");

-- CreateIndex
CREATE UNIQUE INDEX "players_email_key" ON "players"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_id_player_key" ON "Wallet"("id_player");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_id_player_fkey" FOREIGN KEY ("id_player") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - The values [WITHDRAWAL] on the enum `Transactions` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Transactions_new" AS ENUM ('DEPOSIT', 'WITHDRAWALS', 'SEM_TRANSACAO');
ALTER TABLE "Transactions_month" ALTER COLUMN "type_transactions" TYPE "Transactions_new" USING ("type_transactions"::text::"Transactions_new");
ALTER TYPE "Transactions" RENAME TO "Transactions_old";
ALTER TYPE "Transactions_new" RENAME TO "Transactions";
DROP TYPE "Transactions_old";
COMMIT;

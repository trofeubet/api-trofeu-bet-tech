import { PrismaTransactionsMonthRepository } from "@/repositories/prisma/prisma-transactions-month";
import { UpdateTransactionMonthUseCase } from "@/use-cases/transactions-month/update-transaction-month";

export function makeUpdateTransactionMonthUseCase(){
    const transactionsMonthRepository = new PrismaTransactionsMonthRepository()
    const updateTransactionMonthUseCase = new UpdateTransactionMonthUseCase(transactionsMonthRepository)

    return updateTransactionMonthUseCase
}
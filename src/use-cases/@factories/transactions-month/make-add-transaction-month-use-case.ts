import { PrismaTransactionsMonthRepository } from "@/repositories/prisma/prisma-transactions-month";
import { AddTransactionsMonthUseCase } from "@/use-cases/transactions-month/add-transaction-month";

export function makeAddTransactionsMonthUseCase(){
    const transactionMonthRepository = new PrismaTransactionsMonthRepository()
    const addTransactionsMonthUseCase = new AddTransactionsMonthUseCase(transactionMonthRepository)

    return addTransactionsMonthUseCase
}
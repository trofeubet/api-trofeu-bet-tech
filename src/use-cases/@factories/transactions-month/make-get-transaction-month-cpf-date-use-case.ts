import { PrismaTransactionsMonthRepository } from "@/repositories/prisma/prisma-transactions-month";
import { GetTransactionMonthUseCase } from "@/use-cases/transactions-month/get-transaction-month-by-date-cpf";

export function makeGetTransactionsMonthByCpfDateUseCase(){
    const transactionsMonthRepository = new PrismaTransactionsMonthRepository()
    const getTransactionsMonthUseCase = new GetTransactionMonthUseCase(transactionsMonthRepository)

    return getTransactionsMonthUseCase
}
import { PrismaTransactionsMonthRepository } from "@/repositories/prisma/prisma-transactions-month";
import { DeleteByCpfTransactionMonthUseCase } from "@/use-cases/transactions-month/delete-transactions-month-by-cpf";

export function makeDeleteByCpfTransactionMonthUseCaseUseCase(){
    const transactionsMonthRepository = new PrismaTransactionsMonthRepository()
    const deleteTransactionsMonthUseCase = new DeleteByCpfTransactionMonthUseCase(transactionsMonthRepository)

    return deleteTransactionsMonthUseCase
}
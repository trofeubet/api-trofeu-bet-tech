import { PrismaDepositsMonthRepository } from "@/repositories/prisma/prisma-deposits-month";
import { GetDepositMonthUseCase } from "@/use-cases/deposits-month/get-deposit-month-by-date-cpf";

export function makeGetDepositMonthByCpfDateUseCase(){
    const depositMonthRepository = new PrismaDepositsMonthRepository()
    const getDepositMonthUseCase = new GetDepositMonthUseCase(depositMonthRepository)

    return getDepositMonthUseCase
}
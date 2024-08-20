import { PrismaDepositsMonthRepository } from "@/repositories/prisma/prisma-deposits-month";
import { AddDepositMonthUseCase } from "@/use-cases/deposits-month/add-deposit-month";

export function makeAddDepositMonthUseCase(){
    const depositMonthRepository = new PrismaDepositsMonthRepository()
    const addDepositMonthUseCase = new AddDepositMonthUseCase(depositMonthRepository)

    return addDepositMonthUseCase
}
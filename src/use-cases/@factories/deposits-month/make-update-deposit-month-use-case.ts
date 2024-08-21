import { PrismaDepositsMonthRepository } from "@/repositories/prisma/prisma-deposits-month";
import { UpdateDepositMonthUseCase } from "@/use-cases/deposits-month/update-deposit-month";

export function makeUpdateDepositMonthUseCase(){
    const depositMonthRepository = new PrismaDepositsMonthRepository()
    const updateDepositMonthUseCase = new UpdateDepositMonthUseCase(depositMonthRepository)

    return updateDepositMonthUseCase
}
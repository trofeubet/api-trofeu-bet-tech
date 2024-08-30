import { PrismaPlayersRepository } from "@/repositories/prisma/prisma-players-repository";
import { ChartWithdrawlDepositMonthByPlayerUseCase } from "@/use-cases/player/chart-withdrawal-deposit-month-by-player";

export function makeChartWithdrawlDepositMonthByPlayerUseCase(){
    const playersRepository = new PrismaPlayersRepository()
    const chartWithdrawlDepositMonthByPlayerUseCase = new ChartWithdrawlDepositMonthByPlayerUseCase(playersRepository)

    return chartWithdrawlDepositMonthByPlayerUseCase
}
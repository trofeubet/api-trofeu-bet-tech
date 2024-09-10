import { PrismaPlayersRepository } from "@/repositories/prisma/prisma-players-repository";
import { GetFullAmountLtvUseCase } from "@/use-cases/player/get-full-amount-ltv";

export function makeGetFullAmountLtvUseCase(){
    const playersRepository = new PrismaPlayersRepository()
    const getFullAmountLtvUseCase = new GetFullAmountLtvUseCase(playersRepository)

    return getFullAmountLtvUseCase
}
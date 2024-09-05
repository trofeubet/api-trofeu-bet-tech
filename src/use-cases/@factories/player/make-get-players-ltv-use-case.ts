import { PrismaPlayersRepository } from "@/repositories/prisma/prisma-players-repository";
import { GetPlayersLtvUseCase } from "@/use-cases/player/get-players-ltv";

export function makeGetPlayersLtvUseCase(){
    const playersRepository = new PrismaPlayersRepository()
    const getPlayersLtvUseCase = new GetPlayersLtvUseCase(playersRepository)

    return getPlayersLtvUseCase
}
import { PrismaPlayersRepository } from "@/repositories/prisma/prisma-players-repository";
import { GetPlayerUniqueUseCase } from "@/use-cases/player/get-unique-player";

export function makeGetPlayerUniqueUseCase(){
    const playersRepository = new PrismaPlayersRepository()
    const getPlayerUniqueUseCase = new GetPlayerUniqueUseCase(playersRepository)

    return getPlayerUniqueUseCase
}
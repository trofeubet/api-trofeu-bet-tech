import { PrismaPlayersRepository } from "@/repositories/prisma/prisma-players-repository";
import { GetPlayerUniqueByIdPlatformUseCase } from "@/use-cases/player/get-unique-player-by-id-platform";

export function makeGetPlayerUniqueByIdPlatformUseCase(){
    const playersRepository = new PrismaPlayersRepository()
    const getPlayerUniqueByIdPlatformUseCase = new GetPlayerUniqueByIdPlatformUseCase(playersRepository)

    return getPlayerUniqueByIdPlatformUseCase
}
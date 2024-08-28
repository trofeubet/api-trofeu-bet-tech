import { PrismaPlayersRepository } from "@/repositories/prisma/prisma-players-repository";
import { GetPlayersUseCase } from "@/use-cases/player/get-players";

export function makeGetPlayersUseCase(){
    const playersRepository = new PrismaPlayersRepository()
    const getPlayersUseCase = new GetPlayersUseCase(playersRepository)

    return getPlayersUseCase
}
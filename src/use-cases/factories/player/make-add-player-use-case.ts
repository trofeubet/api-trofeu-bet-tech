import { PrismaPlayersRepository } from "@/repositories/prisma/prisma-players-repository";
import { AddPlayerUseCase } from "@/use-cases/player/add-player";

export function makeAddPlayerUseCase(){
    const playersRepository = new PrismaPlayersRepository()
    const addPlayerUseCase = new AddPlayerUseCase(playersRepository)

    return addPlayerUseCase
}
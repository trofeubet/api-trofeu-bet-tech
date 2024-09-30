import { PrismaPlayersRepository } from "@/repositories/prisma/prisma-players-repository";
import { GetPlayerByCpfUseCase } from "@/use-cases/player/get-unique-player-by-cpf";

export function makeGetPlayerByCpfUseCase(){
    const playersRepository = new PrismaPlayersRepository()
    const getPlayerByCpfUseCase = new GetPlayerByCpfUseCase(playersRepository)

    return getPlayerByCpfUseCase
}
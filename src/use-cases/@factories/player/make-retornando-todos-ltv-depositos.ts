import { PrismaPlayersRepository } from "@/repositories/prisma/prisma-players-repository";
import { RetornandoTodosAmountLtvUseCase } from "@/use-cases/player/retornando-todos-ltv-depositos";

export function makeRetornandoTodosAmountLtvUseCase(){
    const playersRepository = new PrismaPlayersRepository()
    const retornandoTodosAmountLtvUseCase = new RetornandoTodosAmountLtvUseCase(playersRepository)

    return retornandoTodosAmountLtvUseCase
}
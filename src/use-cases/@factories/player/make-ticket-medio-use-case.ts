import { PrismaPlayersRepository } from "@/repositories/prisma/prisma-players-repository";
import { GetTicketMedioUseCase } from "@/use-cases/player/ticket-medio-players";

export function makeGetTicketMedioUseCase(){
    const playersRepository = new PrismaPlayersRepository()
    const getTicketMedioUseCase = new GetTicketMedioUseCase(playersRepository)

    return getTicketMedioUseCase
}
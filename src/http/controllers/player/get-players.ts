import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetPlayersUseCase } from "@/use-cases/@factories/player/make-get-players-use-case";
import { ErrorLoadingPlayers } from "@/use-cases/@errors/error-loading-players";
import { ErrorLoadingPage } from "@/use-cases/@errors/error-loading-page";

export async function getPlayers(request: FastifyRequest, reply: FastifyReply) {
    const getPlayersBodySchema = z.object({
        page: z.number().min(1, "Page must be a positive number").default(1),
        name: z.string().optional(),
        id_jogador: z.number().optional(),
        tell: z.string().optional(),
        email: z.string().optional(),
        cpf: z.string().optional(),
    })

    const { 
        page,
        name,
        id_jogador,
        tell,
        email,
        cpf
    } = getPlayersBodySchema.parse(request.body)

    try {
        const getPlayersUseCase = makeGetPlayersUseCase()

        const { playersList, totalItens, totalPages } = await getPlayersUseCase.execute({
            page,
            name,
            id_jogador,
            tell,
            email,
            cpf
        })

        return reply.status(200).send({
            totalItens,
            totalPages,
            currentPage: page,
            playersList,
        })

    } catch (error) {
        if(
            error instanceof ErrorLoadingPlayers ||
            error instanceof ErrorLoadingPage)
        {
            return reply.status(409).send({message: error.message})
        }

        throw error
    }
}
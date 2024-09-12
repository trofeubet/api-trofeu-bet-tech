import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetTicketMedioUseCase } from "@/use-cases/@factories/player/make-ticket-medio-use-case"
import { ErrorLoadingPage } from "@/use-cases/@errors/error-loading-page";
import { AnoInvalido } from "@/use-cases/@errors/error-ano-invalido";
import { ErrorLoadingAverageTicket } from "@/use-cases/@errors/error-loading-average-ticket";

export async function getTicketMedio(request: FastifyRequest, reply: FastifyReply) {
    const getTicketMedioBodySchema = z.object({
        ano: z.string()
    })

    const { 
        ano
    } = getTicketMedioBodySchema.parse(request.body)

    try {
        const getTicketMedioUseCase = makeGetTicketMedioUseCase()

        const { averageTicket } = await getTicketMedioUseCase.execute({
            ano
        })

        return reply.status(200).send({
            averageTicket
        })

    } catch (error) {
        if(
            error instanceof AnoInvalido ||
            error instanceof ErrorLoadingAverageTicket)
        {
            return reply.status(409).send({message: error.message})
        }

        throw error
    }
}
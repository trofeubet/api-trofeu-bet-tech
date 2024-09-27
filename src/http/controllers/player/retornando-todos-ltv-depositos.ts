import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeRetornandoTodosAmountLtvUseCase } from "@/use-cases/@factories/player/make-retornando-todos-ltv-depositos";
import { ErrorLoadingPlayers } from "@/use-cases/@errors/error-loading-players";
import { ErrorLoadingPage } from "@/use-cases/@errors/error-loading-page";

export async function retornandoTodosDepositsLTV(request: FastifyRequest, reply: FastifyReply) {
    const retornandoTodosLtvBodySchema = z.object({
        startDate: z.string(),
        endDate: z.string(),
    });

    const { startDate, endDate } = retornandoTodosLtvBodySchema.parse(request.body);

    try {
        const retornandoTodosLtvUseCase = makeRetornandoTodosAmountLtvUseCase();
        const response = await retornandoTodosLtvUseCase.execute({
            startDate,
            endDate
        });

        return reply.status(200).send(response);

    } catch (error) {
        if (
            error instanceof ErrorLoadingPlayers ||
            error instanceof ErrorLoadingPage
        ) {
            return reply.status(409).send({ message: error.message });
        }

        throw error;
    }
}

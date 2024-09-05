import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetPlayersLtvUseCase } from "@/use-cases/@factories/player/make-get-players-ltv-use-case";
import { ErrorLoadingPlayers } from "@/use-cases/@errors/error-loading-players";
import { ErrorLoadingPage } from "@/use-cases/@errors/error-loading-page";

export async function getPlayersLTV(request: FastifyRequest, reply: FastifyReply) {
    const getPlayersLtvBodySchema = z.object({
        date_init: z.string(),
        date_finish: z.string(),
    });

    const { date_init, date_finish } = getPlayersLtvBodySchema.parse(request.body);

    try {
        const getPlayersLtvUseCase = makeGetPlayersLtvUseCase();
        const { totalCount, depositCountsPerMonth } = await getPlayersLtvUseCase.execute({
            date_init,
            date_finish
        });


        return reply.status(200).send({
            totalPlayers: totalCount,
            depositCountsPerMonth
        });

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

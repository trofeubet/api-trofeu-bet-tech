import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetFullAmountLtvUseCase } from "@/use-cases/@factories/player/make-get-fullt-amount-ltv-use-case";
import { ErrorLoadingPlayers } from "@/use-cases/@errors/error-loading-players";
import { ErrorLoadingPage } from "@/use-cases/@errors/error-loading-page";

export async function getDepositsLTV(request: FastifyRequest, reply: FastifyReply) {
    const getDepositsLtvBodySchema = z.object({
        date_init: z.string(),
        date_finish: z.string(),
    });

    const { date_init, date_finish } = getDepositsLtvBodySchema.parse(request.body);

    try {
        const getDepositsLtvUseCase = makeGetFullAmountLtvUseCase();
        const { totalAmount, depositAmountPerMonth } = await getDepositsLtvUseCase.execute({
            date_init,
            date_finish
        });


        return reply.status(200).send({
            totalAmount,
            depositAmountPerMonth
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

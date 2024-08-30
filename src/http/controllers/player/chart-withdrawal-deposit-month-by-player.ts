import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetPlayerUniqueUseCase } from "@/use-cases/@factories/player/make-get-unique-player-use-case";
import { PlayerNotExistsError } from "@/use-cases/@errors/player-not-exists";
import { makeChartWithdrawlDepositMonthByPlayerUseCase } from "@/use-cases/@factories/player/make-chart-withdraw-deposit-month-by-player-use-case";

export async function chartWithdrawalDepositMonthByPlayer(request: FastifyRequest, reply: FastifyReply) {
    const chartWithdrawalDepositMonthByPlayerParamsSchema = z.object({
        id: z.string(),
        ano: z.string().optional().default("2024")
    });
    
    const { id, ano } = chartWithdrawalDepositMonthByPlayerParamsSchema.parse(request.body);

    try {
        const getUniquePlayerUseCase = makeGetPlayerUniqueUseCase();
        const player = await getUniquePlayerUseCase.execute({ id });

        const chartWithdrawlDepositMonthByPlayerUseCase = makeChartWithdrawlDepositMonthByPlayerUseCase();
        const chart = await chartWithdrawlDepositMonthByPlayerUseCase.execute({
            ano,
            Transactions_month: player.player.Transactions_month
        })

        return reply.status(200).send( chart );
    } catch (error) {
        if (error instanceof PlayerNotExistsError) {
            return reply.status(409).send({ message: error.message });
        }
        throw error;
    }
}

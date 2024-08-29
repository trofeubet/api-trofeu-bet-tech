import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetPlayerUniqueUseCase } from "@/use-cases/@factories/player/make-get-unique-player-use-case";
import { PlayerNotExistsError } from "@/use-cases/@errors/player-not-exists";

export async function getUniquePlayer(request: FastifyRequest, reply: FastifyReply) {
    const getUniquePlayerParamsSchema = z.object({
        id: z.string()
    });
    
    const { id } = getUniquePlayerParamsSchema.parse(request.params);

    try {
        const getUniquePlayerUseCase = makeGetPlayerUniqueUseCase();
        const player = await getUniquePlayerUseCase.execute({ id });

        return reply.status(200).send( player );
    } catch (error) {
        if (error instanceof PlayerNotExistsError) {
            return reply.status(409).send({ message: error.message });
        }
        throw error;
    }
}

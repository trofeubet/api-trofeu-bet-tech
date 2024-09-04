import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetUserUniqueUseCase } from "@/use-cases/@factories/user/make-get-unique-user-use-case";
import { UserNotExistsError } from "@/use-cases/@errors/user-not-exists";


export async function getUniqueUser(request: FastifyRequest, reply: FastifyReply) {
    const getUniqueUserParamsSchema = z.object({
        id: z.string()
    });
    
    const { id } = getUniqueUserParamsSchema.parse(request.params);

    try {
        const getUniqueUserUseCase = makeGetUserUniqueUseCase();
        const user = await getUniqueUserUseCase.execute({ id });

        return reply.status(200).send( user );
    } catch (error) {
        if (error instanceof UserNotExistsError) {
            return reply.status(409).send({ message: error.message });
        }
        throw error;
    }
}

import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetUserUseCase } from "@/use-cases/@factories/user/make-get-user-use-case";

export async function getUser(request: FastifyRequest, reply: FastifyReply) {
    try {
        
        const userId = request.user.sub;

        const getUserUseCase = makeGetUserUseCase();

        const user = await getUserUseCase.execute({
            id: userId
        });

        return reply.status(200).send(user);

    } catch (error) {
        return reply.status(500).send({ message: 'Internal server error' });
    }
}

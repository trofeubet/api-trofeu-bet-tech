import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetProfileUseCase } from "@/use-cases/@factories/user/make-get-profile-use-case"

export async function getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
        
        const userId = request.user.sub;

        const getUserUseCase = makeGetProfileUseCase();

        const user = await getUserUseCase.execute({
            id: userId
        });

        return reply.status(200).send(user);

    } catch (error) {
        return reply.status(500).send({ message: 'Internal server error' });
    }
}

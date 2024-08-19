import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { InvalidCredentialsError } from "@/use-cases/errors/invalid-credentials-error";
import { UserInactive } from "@/use-cases/errors/user-inactive";
import { makeAuthenticateUserUseCase } from "@/use-cases/factories/user/make-authenticate-user-use-case";

export async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
    const authenticateUserBodySchema = z.object({
        email: z.string().email(),
        password: z.string().min(6)
    })

    const { email, password } = authenticateUserBodySchema.parse(request.body)

    try {
        const authenticateUserUseCase = makeAuthenticateUserUseCase()

        const { user } = await authenticateUserUseCase.execute({
            email,
            password
        })

        const token = await reply.jwtSign(
            {}, 
            {
            sign: {
                sub: user.id
            }
            }
        )

        return reply.status(200).send({token})

    } catch (error) {
        if(
               error instanceof InvalidCredentialsError 
            || error instanceof UserInactive) {
        
            return reply.status(409).send({message: error.message})
        }
        throw error
    }
}
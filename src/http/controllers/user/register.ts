import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { UserAlreadyExistsError } from "@/use-cases/errors/user-already-exists";
import { makeRegisterUserUseCase } from "@/use-cases/factories/user/make-register-user-use-case";

export async function registerUser(request: FastifyRequest, reply: FastifyReply) {
    const registerUserBodySchema = z.object({
        name: z.string(),
        gender: z.string(),
        email: z.string().email(),
        password: z.string().min(6)
    })

    const { name, email, password, gender} = registerUserBodySchema.parse(request.body)

    try {
        const registerUserUseCase = makeRegisterUserUseCase()

        await registerUserUseCase.execute({
            name,
            email,
            password,
            gender
        })

    } catch (error) {
        if(error instanceof UserAlreadyExistsError) {
            return reply.status(409).send({message: error.message})
        }
        throw error
    }

    return reply.status(201).send({message: "Usuário cadastrado com sucesso! Entre em contato com o time de desenvolvimento para ativar sua conta."})
}
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeUpdateUserUseCase } from "@/use-cases/@factories/user/make-update-user-use-case";
import { UserNotExistsError } from "@/use-cases/@errors/user-not-exists";

export async function updateUser(request: FastifyRequest, reply: FastifyReply) {
    const updateUserBodySchema = z.object({
        id: z.string(),
        name: z.string().optional(),
        gender: z.enum(['masculino', 'feminino']).optional(),
        email: z.string().email().optional(),
        status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
        sector: z.enum(["DESENVOLVIMENTO", "USER", "TRAFEGO", "GERENCIAL", "AFILIADOS", "FINANCEIRO", "RISCO"]).optional()
    })

    const { id, name, gender, email, status, sector} = updateUserBodySchema.parse(request.body)

    try {
        const updateUserUseCase = makeUpdateUserUseCase()

        const updateUser = await updateUserUseCase.execute({
            id,
            name,
            gender,
            email,
            status,
            sector
        })

        return reply.status(200).send({
            message: "Usuário alterado com sucesso!",
            updateUser
        })


    } catch (error) {
        if(error instanceof UserNotExistsError) {
            return reply.status(409).send({message: error.message})
        }
        throw error
    }
}
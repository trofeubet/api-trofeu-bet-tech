import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetUsersUseCase } from "@/use-cases/@factories/user/make-get-users-use-case";
import { ErrorLoadingPage } from "@/use-cases/@errors/error-loading-page";
import { ErrorLoadingUsers } from "@/use-cases/@errors/error-loading-users";

export async function getUsers(request: FastifyRequest, reply: FastifyReply) {
    const getUsersBodySchema = z.object({
        page: z.number(),
        name: z.string().optional(),
        email: z.string().optional()
    })

    const { 
        page,
        name,
        email
    } = getUsersBodySchema.parse(request.body)

    try {
        const getUsersUseCase = makeGetUsersUseCase()

        const { usersList, totalItens, totalPages } = await getUsersUseCase.execute({
            page,
            name,
            email
        })

        return reply.status(200).send({
            totalItens,
            totalPages,
            currentPage: page,
            usersList
        })

    } catch (error) {
        if(
            error instanceof ErrorLoadingUsers ||
            error instanceof ErrorLoadingPage)
        {
            return reply.status(409).send({message: error.message})
        }

        throw error
    }
}
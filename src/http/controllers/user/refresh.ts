import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { InvalidCredentialsError } from "@/use-cases/@errors/invalid-credentials-error";
import { UserInactive } from "@/use-cases/@errors/user-inactive";
import { makeAuthenticateUserUseCase } from "@/use-cases/@factories/user/make-authenticate-user-use-case";

export async function refresh(request: FastifyRequest, reply: FastifyReply) {

    await request.jwtVerify({ onlyCookie: true })
    
    const { sector } = request.user

    const token = await reply.jwtSign(
        {
            sector
        }, 
        {
        sign: {
            sub: request.user.sub
        }
        }
    )

    const refreshToken = await reply.jwtSign(
        {
            sector
        }, 
        {
        sign: {
            sub: request.user.sub,
            expiresIn: '5d'
        }
        }
    )

    return reply
    .setCookie('refreshToken', refreshToken, {
        path: '/',
        secure: true,
        sameSite: true,
        httpOnly: true
    })
    .status(200).send({token})

    
}
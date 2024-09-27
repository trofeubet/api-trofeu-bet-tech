import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetPlayerUniqueByIdPlatformUseCase } from "@/use-cases/@factories/player/make-get-unique-player-by-id-platform-use-case"
import { PlayerNotExistsError } from "@/use-cases/@errors/player-not-exists";
import { makeUpdateWalletUseCase } from "@/use-cases/@factories/wallet/make-update-wallet-use-case";

export async function updateFtdDatePlayer(request: FastifyRequest, reply: FastifyReply) {
    const updateFtdDatePlayerBodySchema = z.object({
        id_platform: z.number(),
        ftd_date: z.string(),
    })

    const { 
        id_platform, ftd_date
    } = updateFtdDatePlayerBodySchema.parse(request.body)

    try {
        const getUniquePlayerByIdPlatformUseCase = makeGetPlayerUniqueByIdPlatformUseCase()
        const updateWalletUseCase = makeUpdateWalletUseCase()

        const { player } = await getUniquePlayerByIdPlatformUseCase.execute({
            id_platform
        })

        const walletUpdate  = await updateWalletUseCase.execute({
            id: player.Wallet?.id || "",
            ftd_date: new Date(ftd_date)
        })

        return reply.status(200).send({
            player,
            walletUpdate
        })

    } catch (error) {
        if(
            error instanceof PlayerNotExistsError)
        {
            return reply.status(409).send({message: error.message})
        }

        throw error
    }
}
import { Prisma, Player } from '@prisma/client'
import { PlayersRepository } from '../players-repository'
import { prisma } from '@/lib/prisma'

export class PrismaPlayersRepository implements PlayersRepository {
    async createPlayer(data: Prisma.PlayerCreateInput): Promise<Player> {
        const player = await prisma.player.create({
            data
        })

        return player
    }

    async findByIdPlatform(id_platform: number): Promise<Player | null> {
        const player = await prisma.player.findUnique({
            where: {
                id_platform
            },
            include: {
                Wallet: true
            }
        })
        
        return player
    }

    async findByEmail(email: string): Promise<Player | null> {
        const player = await prisma.player.findUnique({
            where: {
                email
            }
        })

        return player
    }
}
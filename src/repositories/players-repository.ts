import { Prisma, Player } from '@prisma/client'

export interface PlayersRepository {
    createPlayer(data: Prisma.PlayerCreateInput): Promise<Player>
    findByIdPlatform(id_platform: number): Promise<Player | null>
    findByEmail(email: string): Promise<Player | null>
}
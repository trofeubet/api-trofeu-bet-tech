import { Prisma, Player } from '@prisma/client'

export interface PlayersRepository {
    createPlayer(data: Prisma.PlayerCreateInput): Promise<Player>
    findByIdPlatform(id_platform: number): Promise<Player | null>
    findByEmail(email: string): Promise<Player | null>
    getPlayers(take: number, page: number, name?: string, id_platform?: number, tell?: string, email?: string, cpf?: string): Promise<{ players: Prisma.PlayerGetPayload<{
        include: {
            Transactions_month: true,
            Wallet: true
        }
    }>[]; totalCount: number, }>
    getUniquePlayer(id: string): Promise<{ player: Prisma.PlayerGetPayload<{
        include: {
            Transactions_month: true,
            Wallet: true
        }
    }>} | null>
}
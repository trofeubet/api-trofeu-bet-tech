import { Prisma, Wallet, Player } from '@prisma/client'

export interface WalletRepository {
    createWallet(data: Prisma.WalletCreateInput): Promise<Wallet>
    updateWallet(data: Prisma.WalletUpdateInput): Promise<Wallet>
    findByCpf(cpf: string): Promise<Prisma.PlayerGetPayload<{
        include: {
            Wallet: true
        }
    }> | null>
}
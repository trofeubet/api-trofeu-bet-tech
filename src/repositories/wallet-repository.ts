import { Prisma, Wallet } from '@prisma/client'

export interface WalletRepository {
    createWallet(data: Prisma.WalletCreateInput): Promise<Wallet>
}
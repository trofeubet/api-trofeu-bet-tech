import { Prisma, Wallet } from '@prisma/client'
import { WalletRepository } from '../wallet-repository'
import { prisma } from '@/lib/prisma'

export class PrismaWalletRepository implements WalletRepository {
    async createWallet(data: Prisma.WalletCreateInput) {
        const wallet = await prisma.wallet.create({
            data
        })

        return wallet
    }
}
import { Player, Prisma, Wallet } from '@prisma/client'
import { WalletRepository } from '../wallet-repository'
import { prisma } from '@/lib/prisma'

export class PrismaWalletRepository implements WalletRepository {
    async createWallet(data: Prisma.WalletCreateInput) {
        const wallet = await prisma.wallet.create({
            data
        })

        return wallet
    }

    async updateWallet(data: Prisma.WalletUpdateInput): Promise<Wallet> {
        const existingWallet = await prisma.wallet.findUnique({
            where: { id: data.id?.toString() }
        });
    
        if (!existingWallet) {
            throw new Error(`Wallet with ID ${data.id?.toString()} not found`);
        }

        const updateWallet = await prisma.wallet.update({
            where: { id: data.id?.toString() },
            data
        })

        return updateWallet
    }

    async findByCpf(cpf: string): Promise<{ Wallet: Wallet | null } & Player | null> {
        const player = await prisma.player.findUnique({
            where: {
                cpf: cpf
            },
            include: {
                Wallet: true
            }
        })
        
        return player
    }
}
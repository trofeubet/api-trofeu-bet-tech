import { Prisma, Player, Deposits_month } from '@prisma/client'
import { DepositsMonthRepository } from '../deposit-month-repository'
import { prisma } from '@/lib/prisma'

export class PrismaDepositsMonthRepository implements DepositsMonthRepository {

    async createDepositsMonth(data: Prisma.Deposits_monthCreateInput): Promise<Deposits_month> {
        const deposits_month = await prisma.deposits_month.create({
            data
        })

        return deposits_month
    }

    async findByCpf(cpf: string): Promise<{ Deposits_month: Deposits_month[] } & Player | null> {
        const player = await prisma.player.findUnique({
            where: {
                cpf: cpf
            },
            include: {
                Deposits_month: true
            }
        })
        
        return player
    }
}
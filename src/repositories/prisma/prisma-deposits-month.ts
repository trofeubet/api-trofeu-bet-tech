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

    async updateDepositsMonth(data: Prisma.Deposits_monthUpdateInput): Promise<Deposits_month> {
        const deposits_month = await prisma.deposits_month.update({
            where: {
                id: data.id?.toString()
            },
            data
        })

        return deposits_month
    }

    async findDepositsMonthByDateCpf(date: Date, cpf: string): Promise<Deposits_month | null> {
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
        const deposits_month = await prisma.deposits_month.findFirst({
            where: {
                cpf: cpf,
                date_deposits: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });
    
        return deposits_month;
    }
    
}
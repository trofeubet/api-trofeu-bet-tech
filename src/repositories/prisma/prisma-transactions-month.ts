import { Prisma, Player, Transactions_month, Transactions } from '@prisma/client'
import { TransactionsMonthRepository } from '../transactions-month-repository'
import { prisma } from '@/lib/prisma'

export class PrismaTransactionsMonthRepository implements TransactionsMonthRepository {

    async createTransactionsMonth(data: Prisma.Transactions_monthCreateInput): Promise<Transactions_month> {
        const transactions_month = await prisma.transactions_month.create({
            data
        })

        return transactions_month
    }

    async findByCpf(cpf: string): Promise<{ Transactions_month: Transactions_month[] } & Player | null> {
        const player = await prisma.player.findUnique({
            where: {
                cpf: cpf
            },
            include: {
                Transactions_month: true
            }
        })
        
        return player
    }

    async updateTransactionsMonth(data: Prisma.Transactions_monthUpdateInput): Promise<Transactions_month> {
        const transaction_month = await prisma.transactions_month.update({
            where: {
                id: data.id?.toString()
            },
            data
        })

        return transaction_month
    }

    async findTransactionsMonthByDateCpf(date: Date, cpf: string, type_transaction: Transactions): Promise<Transactions_month | null> {
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
        const transactions_month = await prisma.transactions_month.findFirst({
            where: {
                cpf: cpf,
                type_transactions: type_transaction,
                date_transactions: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });
    
        return transactions_month;
    }
}
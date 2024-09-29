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

    async deleteTransactionsMonthByCpf(cpf: string, type_transactions: "DEPOSIT" | "WITHDRAWALS"): Promise<Transactions_month[] | null> {
        // Primeiro, busque as transações que vão ser deletadas
        const transactions = await prisma.transactions_month.findMany({
            where: {
                cpf: cpf,
                type_transactions: type_transactions
            }
        });

        console.log("TRANSAÇÕES",transactions)
    
        if (transactions.length === 0) {
            return null; // Se não houver transações, retorne null
        }
    
        // Deleta as transações
        const transacoesDel = await prisma.transactions_month.deleteMany({
            where: {
                cpf: cpf,
                type_transactions: type_transactions
            }
        });

        console.log("TRANSAÇÕES DELETADAS",transacoesDel)
    
        // Retorna as transações deletadas
        return transactions;
    }
    
}
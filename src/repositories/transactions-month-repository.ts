import { Prisma, Transactions_month, Player, Transactions } from '@prisma/client'

export interface TransactionsMonthRepository {
    createTransactionsMonth(data: Prisma.Transactions_monthCreateInput): Promise<Transactions_month>
    findByCpf(cpf: string): Promise<Prisma.PlayerGetPayload<{
        include: {
            Transactions_month: true
        }
    }> | null>
    updateTransactionsMonth(data: Prisma.Transactions_monthUpdateInput): Promise<Transactions_month>
    findTransactionsMonthByDateCpf(date: Date, cpf: string, type_transaction: Transactions): Promise<Transactions_month | null>
    deleteTransactionsMonthByCpf(cpf: string, type_transactions: "DEPOSIT" | "WITHDRAWALS"): Promise<Transactions_month[] | null>
}
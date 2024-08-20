import { Prisma, Deposits_month, Player } from '@prisma/client'

export interface DepositsMonthRepository {
    createDepositsMonth(data: Prisma.Deposits_monthCreateInput): Promise<Deposits_month>
    findByCpf(cpf: string): Promise<Prisma.PlayerGetPayload<{
        include: {
            Deposits_month: true
        }
    }> | null>
}
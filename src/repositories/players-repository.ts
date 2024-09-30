import { Prisma, Player } from '@prisma/client'



export interface PlayerWithTransactions {
    id: string;
    Transactions_month: {
        date_transactions: Date | null;
        valor_total_transactions: number;
    }[];
    Wallet: {
        ftd_date: Date | null;
    } | null;
}

export interface PlayersRepository {
    createPlayer(data: Prisma.PlayerCreateInput): Promise<Player>
    findByIdPlatform(id_platform: number): Promise<Player | null>
    findByEmail(email: string): Promise<Player | null>
    getPlayers(take: number, page: number, name?: string, id_platform?: number, tell?: string, email?: string, cpf?: string): Promise<{ players: Prisma.PlayerGetPayload<{
        include: {
            Transactions_month: true,
            Wallet: true
        }
    }>[]; totalCount: number, }>
    getUniquePlayer(id: string): Promise<{ player: Prisma.PlayerGetPayload<{
        include: {
            Transactions_month: true,
            Wallet: true
        }
    }>} | null>
    getPlayersByFtdDate(date_init: Date, date_finish: Date): Promise<{ players: Prisma.PlayerGetPayload<{
        include: {
            Transactions_month: true,
            Wallet: true
        }
    }>[], totalCount: number, depositCountsPerMonth: { [key: string]: { count: number, percentage: number } } }>
    // getFullAmountByFtdDate(date_init: Date, date_finish: Date): Promise<{ players: Prisma.PlayerGetPayload<{
    //     include: {
    //         Transactions_month: true,
    //         Wallet: true
    //     }
    // }>[], totalAmount: number, depositAmountPerMonth: { [key: string]: { amount: number, percentage: number } } }>
    getFullAmountByFtdDate(date_init: Date, date_finish: Date): Promise<{ players: PlayerWithTransactions[], totalAmount: number, depositAmountPerMonth: { [key: string]: { amount: number, percentage: number } } }>;
    getQtdPlayersMonthByFtdDate(date_init: Date, date_finish: Date): Promise<number>
    getTotalAmountMonthByFtdDate(date_init: Date, date_finish: Date): Promise<number>
    getUniquePlayerByIdPlatform(id_platform: number): Promise<{ player: Prisma.PlayerGetPayload<{
        include: {
            Transactions_month: true,
            Wallet: true
        }
    }>} | null>
    getFullWithdrawalsByFtdDate(date_init: Date, date_finish: Date): Promise<{ players: PlayerWithTransactions[], totalWithdrawals: number, depositWithdrawalsPerMonth: { [key: string]: { withdrawals: number, percentage: number } } }>;
    getPlyerByCpf(cpf: string): Promise<Prisma.PlayerGetPayload<{
        include: {
            Transactions_month: true,
            Wallet: true
        }
    }> | null>
}
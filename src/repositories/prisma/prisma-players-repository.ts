import { Prisma, Player } from '@prisma/client'
import { PlayersRepository } from '../players-repository'
import { prisma } from '@/lib/prisma'
import { AnoInvalido } from '@/use-cases/@errors/error-ano-invalido'
import { start } from 'repl'

export class PrismaPlayersRepository implements PlayersRepository {
    async createPlayer(data: Prisma.PlayerCreateInput): Promise<Player> {
        const player = await prisma.player.create({
            data
        })

        return player
    }

    async findByIdPlatform(id_platform: number): Promise<Player | null> {
        const player = await prisma.player.findUnique({
            where: {
                id_platform
            },
            include: {
                Wallet: true
            }
        })
        
        return player
    }

    async findByEmail(email: string): Promise<Player | null> {
        const player = await prisma.player.findUnique({
            where: {
                email
            }
        })

        return player
    }

    async getPlayers(
        take: number, 
        page: number, 
        name?: string, 
        id_platform?: number, 
        tell?: string, 
        email?: string, 
        cpf?: string
    ): Promise<{ 
        players: Prisma.PlayerGetPayload<{
            include: {
                Transactions_month: true,
                Wallet: true
            }
        }>[], 
        totalCount: number 
    }> {
    
        const skip = (page - 1) * take;
    
        // Construindo as condições dinamicamente
        const conditions: Prisma.PlayerWhereInput[] = [];
    
        if (name) conditions.push({ name: { contains: name, mode: 'insensitive' } });
        if (id_platform) conditions.push({ id_platform });
        if (tell)  conditions.push({ tell: { contains: tell, mode: 'insensitive' } });    
        if (email)  conditions.push({ email: { contains: email, mode: 'insensitive' } });
        if (cpf) conditions.push({ cpf: { contains: cpf, mode: 'insensitive' } });
        
        // Garantindo que só passemos o AND se tivermos condições
        const whereClause: Prisma.PlayerWhereInput = conditions.length > 0 ? { AND: conditions } : {};
    
        const totalCount = await prisma.player.count({
            where: whereClause
        });
    
        const players = await prisma.player.findMany({
            where: whereClause,
            orderBy: {
                id_platform: 'asc'
            },
            include: {
                Transactions_month: true,
                Wallet: true
            },
            take,
            skip,
        });
    
        return {
            players,
            totalCount
        };
    }

    async getUniquePlayer(id: string): Promise<{ 
        player: Prisma.PlayerGetPayload<{
            include: {
                Transactions_month: true,
                Wallet: true
            }
        }> 
    } | null> {
        const player = await prisma.player.findUnique({
            where: {
                id
            },
            include: {
                Transactions_month: true,
                Wallet: true
            }
        })

        if(!player) {
            return null;
        }

        return {
            player
        }
    }

    async getPlayersByFtdDate(date_init: Date, date_finish: Date): Promise<{ 
        players: Prisma.PlayerGetPayload<{
            include: {
                Transactions_month: true,
                Wallet: true
            }
        }>[], 
        totalCount: number,
        depositCountsPerMonth: { 
            [key: string]: { count: number, percentage: number } // Inclui a porcentagem
        }
    }> {
    
        const dataInicioCorrigida = new Date(date_init);
        dataInicioCorrigida.setUTCHours(0, 0, 0, 1); 
    
        const dataFimCorrigida = new Date(date_finish);
        dataFimCorrigida.setUTCHours(23, 59, 59, 999);
    
        // Obtém os jogadores
        const players = await prisma.player.findMany({
            where: {
                Wallet: {
                    ftd_date: {
                        gte: dataInicioCorrigida,
                        lte: dataFimCorrigida
                    }
                }
            },
            include: {
                Transactions_month: true,
                Wallet: true
            }
        });
    
        const totalCount = players.length;
    
        // Inicializa o mapa de contagem de jogadores por mês, agora com valores de contagem e porcentagem
        const depositCountsPerMonth: { [key: string]: { count: number, percentage: number } } = {
            "Janeiro": { count: 0, percentage: 0 }, 
            "Fevereiro": { count: 0, percentage: 0 }, 
            "Março": { count: 0, percentage: 0 }, 
            "Abril": { count: 0, percentage: 0 }, 
            "Maio": { count: 0, percentage: 0 }, 
            "Junho": { count: 0, percentage: 0 }, 
            "Julho": { count: 0, percentage: 0 }, 
            "Agosto": { count: 0, percentage: 0 }, 
            "Setembro": { count: 0, percentage: 0 }, 
            "Outubro": { count: 0, percentage: 0 }, 
            "Novembro": { count: 0, percentage: 0 }, 
            "Dezembro": { count: 0, percentage: 0 }
        };
    
        // Set para armazenar os jogadores únicos que têm depósitos em cada mês
        const playersWithDeposits: Set<string> = new Set();
    
        // Processa os jogadores e suas transações
        players.forEach(player => {
            player.Transactions_month.forEach(transaction => {
                if (transaction.type_transactions === 'DEPOSIT') {
                    const transactionDate = new Date(transaction.date_transactions ?? '');
    
                    // Obtém o mês como número (1-12)
                    const monthNumber = transactionDate.getUTCMonth() + 1;
                    const monthNames = [
                        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                    ];
                    const monthName = monthNames[monthNumber - 1];
    
                    // Adiciona o jogador ao set de jogadores com depósitos
                    playersWithDeposits.add(player.id);
    
                    // Incrementa a contagem de depósitos no mês correspondente
                    if (depositCountsPerMonth[monthName]) {
                        depositCountsPerMonth[monthName].count++;
                    }
                }
            });
        });
    
        // Calcula a porcentagem para cada mês
        Object.keys(depositCountsPerMonth).forEach(month => {
            const count = depositCountsPerMonth[month].count;
            depositCountsPerMonth[month].percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
        });
    
        return { 
            players,
            totalCount,
            depositCountsPerMonth
        };
    }

    async getFullAmountByFtdDate(date_init: Date, date_finish: Date): Promise<{ 
        players: Prisma.PlayerGetPayload<{
            include: {
                Transactions_month: true,
                Wallet: true
            }
        }>[], 
        totalAmount: number,
        depositAmountPerMonth: { 
            [key: string]: { amount: number, percentage: number } // Inclui a porcentagem
        }
    }> {
        const dataInicioCorrigida = new Date(date_init);
        dataInicioCorrigida.setUTCHours(0, 0, 0, 1); 
    
        const dataFimCorrigida = new Date(date_finish);
        dataFimCorrigida.setUTCHours(23, 59, 59, 999);
    
        // Filtra os jogadores pelo ftd_date no intervalo especificado
        const players = await prisma.player.findMany({
            where: {
                Wallet: {
                    ftd_date: {
                        gte: dataInicioCorrigida,
                        lte: dataFimCorrigida
                    }
                }
            },
            include: {
                Transactions_month: true,
                Wallet: true
            }
        });
    
        // Inicializa o total de depósitos no intervalo de FTD
        let totalAmount = 0;
    
        // Inicializa o mapa de somas de depósitos por mês
        const depositAmountPerMonth: { [key: string]: { amount: number, percentage: number } } = {
            "Janeiro": { amount: 0, percentage: 0 }, 
            "Fevereiro": { amount: 0, percentage: 0 }, 
            "Março": { amount: 0, percentage: 0 }, 
            "Abril": { amount: 0, percentage: 0 }, 
            "Maio": { amount: 0, percentage: 0 }, 
            "Junho": { amount: 0, percentage: 0 }, 
            "Julho": { amount: 0, percentage: 0 }, 
            "Agosto": { amount: 0, percentage: 0 }, 
            "Setembro": { amount: 0, percentage: 0 }, 
            "Outubro": { amount: 0, percentage: 0 }, 
            "Novembro": { amount: 0, percentage: 0 }, 
            "Dezembro": { amount: 0, percentage: 0 }
        };
    
        // Processa os jogadores filtrados e suas transações
        players.forEach(player => {
            // Verifica transações dentro do intervalo de FTD para somar no totalAmount
            player.Transactions_month.forEach(transaction => {
                if (transaction.type_transactions === 'DEPOSIT') {
                    const transactionDate = new Date(transaction.date_transactions ?? '');
        
                    // Filtra os depósitos realizados dentro do intervalo FTD
                    if (transactionDate >= dataInicioCorrigida && transactionDate <= dataFimCorrigida) {
                        const transactionAmount = transaction.valor_total_transactions ?? 0;
                        totalAmount += transactionAmount; // Soma no totalAmount
        
                        // Obtém o mês e o ano da data da transação
                        const monthNumber = transactionDate.getUTCMonth(); // Mês de 0 a 11
                        const yearNumber = transactionDate.getUTCFullYear(); // Ano completo
        
                        // Verifica se o ano e o mês correspondem ao mês que estamos analisando
                        if (yearNumber === 2024) { // Substitua anoAtual pela variável do ano que você está analisando
                            const monthNames = [
                                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                            ];
                            const monthName = monthNames[monthNumber];
        
                            // Soma o valor da transação ao mês correspondente
                            depositAmountPerMonth[monthName].amount += transactionAmount;
                        }
                    }
                }
            });
        });
        
    
        // Calcula a porcentagem para cada mês com base no totalAmount
        Object.keys(depositAmountPerMonth).forEach(month => {
            const amount = depositAmountPerMonth[month].amount;
            depositAmountPerMonth[month].percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
        });
    
        return { 
            players,
            totalAmount,
            depositAmountPerMonth
        };
    }

    async getQtdPlayersMonthByFtdDate(date_init: Date, date_finish: Date): Promise<number> {
        const dataInicioCorrigida = new Date(date_init);
        dataInicioCorrigida.setUTCHours(0, 0, 0, 1); 
    
        const dataFimCorrigida = new Date(date_finish);
        dataFimCorrigida.setUTCHours(23, 59, 59, 999);
    
        // Filtra os jogadores pelo ftd_date no intervalo especificado
        const players = await prisma.player.findMany({
            where: {
                Wallet: {
                    ftd_date: {
                        gte: dataInicioCorrigida,
                        lte: dataFimCorrigida
                    }
                }
            }
        });
    
        // Inicializa o total de jogadores no intervalo de FTD
        const totalPlayersMonth = players.length;
    
        return totalPlayersMonth
    }

    async getTotalAmountMonthByFtdDate(date_init: Date, date_finish: Date): Promise<number> {
        const dataInicioCorrigida = new Date(date_init);
        dataInicioCorrigida.setUTCHours(0, 0, 0, 1); 
    
        const dataFimCorrigida = new Date(date_finish);
        dataFimCorrigida.setUTCHours(23, 59, 59, 999);
    
        let totalAmount = 0;
        let skip = 0;
        const take = 30000; // Tamanho da página
        let hasMorePlayers = true;
    
        while (hasMorePlayers) {
            // Filtra os jogadores pelo ftd_date no intervalo especificado e com paginação
            const players = await prisma.player.findMany({
                where: {
                    Wallet: {
                        ftd_date: {
                            gte: dataInicioCorrigida,
                            lte: dataFimCorrigida
                        }
                    }
                },
                select: {
                    id: true,
                    Transactions_month: {
                        where: {
                            type_transactions: 'DEPOSIT'
                        },
                        select: {
                            valor_total_transactions: true
                        }
                    }
                },
                skip,
                take
            });
    
            // Se não houver mais jogadores, interrompe o loop
            if (players.length === 0) {
                hasMorePlayers = false;
                break;
            }
    
            // Processa os jogadores filtrados e suas transações
            players.forEach(player => {
                player.Transactions_month.forEach(transaction => {
                    const transactionAmount = transaction.valor_total_transactions ?? 0;
                    totalAmount += transactionAmount;
                });
            });
    
            // Incrementa o valor de skip para a próxima página
            skip += take;
        }
    
        return totalAmount;
    }

    async getUniquePlayerByIdPlatform(id_platform: number): Promise<{ 
        player: Prisma.PlayerGetPayload<{
            include: {
                Transactions_month: true,
                Wallet: true
            }
        }> 
    } | null> {
        const player = await prisma.player.findUnique({
            where: {
                id_platform: id_platform
            },
            include: {
                Transactions_month: true,
                Wallet: true
            }
        })

        if(!player) {
            return null;
        }

        return {
            player
        }
    }
    

    async getFullWithdrawalsByFtdDate(date_init: Date, date_finish: Date): Promise<{ 
        players: Prisma.PlayerGetPayload<{
            include: {
                Transactions_month: true,
                Wallet: true
            }
        }>[], 
        totalWithdrawals: number,
        depositWithdrawalsPerMonth: { 
            [key: string]: { withdrawals: number, percentage: number } // Inclui a porcentagem
        }
    }> {
        const dataInicioCorrigida = new Date(date_init);
        dataInicioCorrigida.setUTCHours(0, 0, 0, 1); 
    
        const dataFimCorrigida = new Date(date_finish);
        dataFimCorrigida.setUTCHours(23, 59, 59, 999);
    
        // Filtra os jogadores pelo ftd_date no intervalo especificado
        const players = await prisma.player.findMany({
            where: {
                Wallet: {
                    ftd_date: {
                        gte: dataInicioCorrigida,
                        lte: dataFimCorrigida
                    }
                }
            },
            include: {
                Transactions_month: true,
                Wallet: true
            }
        });
    
        // Inicializa o total de depósitos no intervalo de FTD
        let totalWithdrawals = 0;
    
        // Inicializa o mapa de somas de depósitos por mês
        const depositWithdrawalsPerMonth: { [key: string]: { withdrawals: number, percentage: number } } = {
            "Janeiro": { withdrawals: 0, percentage: 0 }, 
            "Fevereiro": { withdrawals: 0, percentage: 0 }, 
            "Março": { withdrawals: 0, percentage: 0 }, 
            "Abril": { withdrawals: 0, percentage: 0 }, 
            "Maio": { withdrawals: 0, percentage: 0 }, 
            "Junho": { withdrawals: 0, percentage: 0 }, 
            "Julho": { withdrawals: 0, percentage: 0 }, 
            "Agosto": { withdrawals: 0, percentage: 0 }, 
            "Setembro": { withdrawals: 0, percentage: 0 }, 
            "Outubro": { withdrawals: 0, percentage: 0 }, 
            "Novembro": { withdrawals: 0, percentage: 0 }, 
            "Dezembro": { withdrawals: 0, percentage: 0 }
        };
    
        // Processa os jogadores filtrados e suas transações
        players.forEach(player => {
            // Verifica transações dentro do intervalo de FTD para somar no totalWithdrawals
            player.Transactions_month.forEach(transaction => {
                if (transaction.type_transactions === 'WITHDRAWALS') {
                    const transactionDate = new Date(transaction.date_transactions ?? '');
        
                    // Filtra os saques realizados dentro do intervalo FTD
                    if (transactionDate >= dataInicioCorrigida && transactionDate <= dataFimCorrigida) {
                        const transactionWithdrawals = transaction.valor_total_transactions ?? 0;
                        totalWithdrawals += transactionWithdrawals; // Soma no totalWithdrawals
        
                        // Obtém o mês e o ano da data da transação
                        const monthNumber = transactionDate.getUTCMonth(); // Mês de 0 a 11
                        const yearNumber = transactionDate.getUTCFullYear(); // Ano completo
        
                        // Verifica se o ano corresponde ao ano que estamos analisando
                        if (yearNumber === 2024) { // Substitua anoAtual pela variável do ano que você está analisando
                            const monthNames = [
                                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                            ];
                            const monthName = monthNames[monthNumber];
        
                            // Soma o valor da transação ao mês correspondente
                            depositWithdrawalsPerMonth[monthName].withdrawals += transactionWithdrawals;
                        }
                    }
                }
            });
        });
    
        // Calcula a porcentagem para cada mês com base no totalAmount
        Object.keys(depositWithdrawalsPerMonth).forEach(month => {
            const withdrawals = depositWithdrawalsPerMonth[month].withdrawals;
            depositWithdrawalsPerMonth[month].percentage = totalWithdrawals > 0 ? (withdrawals / totalWithdrawals) * 100 : 0;
        });
    
        return { 
            players,
            totalWithdrawals,
            depositWithdrawalsPerMonth
        };
    }

    async getPlyerByCpf(cpf: string): Promise<Prisma.PlayerGetPayload<{
        include: {
            Transactions_month: true,
            Wallet: true
        }
    }> | null> {
        const player = await prisma.player.findUnique({
            where: {
                cpf
            },
            include: {
                Transactions_month: true,
                Wallet: true
            }
        })

        return player
    }
}
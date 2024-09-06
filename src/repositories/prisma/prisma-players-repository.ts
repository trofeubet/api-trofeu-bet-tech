import { Prisma, Player } from '@prisma/client'
import { PlayersRepository } from '../players-repository'
import { prisma } from '@/lib/prisma'

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
        depositCountsPerMonth: { [key: string]: number } // Adiciona esta linha para contar jogadores por mês
    }> {
    
        const dataInicioCorrigida = new Date(date_init);
        dataInicioCorrigida.setUTCHours(0, 0, 0, 0); 
    
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
    
        // Inicializa o mapa de contagem de jogadores por mês
        const depositCountsPerMonth: { [key: string]: number } = {
            "Janeiro": 0, "Fevereiro": 0, "Marco": 0, "Abril": 0, "Maio": 0, "Junho": 0,
            "Julho": 0, "Agosto": 0, "Setembro": 0, "Outubro": 0, "Novembro": 0, "Dezembro": 0
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
                    if (depositCountsPerMonth[monthName] !== undefined) {
                        depositCountsPerMonth[monthName]++;
                    }
                }
            });
        });
    
        // Conta o número de jogadores que têm depósitos em cada mês subsequente
        const depositCountsPerMonthForPlayers: { [key: string]: number } = {
            "Janeiro": 0, "Fevereiro": 0, "Marco": 0, "Abril": 0, "Maio": 0, "Junho": 0,
            "Julho": 0, "Agosto": 0, "Setembro": 0, "Outubro": 0, "Novembro": 0, "Dezembro": 0
        };
    
        players.forEach(player => {
            if (playersWithDeposits.has(player.id)) {
                player.Transactions_month.forEach(transaction => {
                    if (transaction.type_transactions === 'DEPOSIT') {
                        const transactionDate = new Date(transaction.date_transactions ?? '');
    
                        // Obtém o mês como número (1-12)
                        const monthNumber = transactionDate.getUTCMonth() + 1;
                        const monthNames = [
                            "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
                            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                        ];
                        const monthName = monthNames[monthNumber - 1];
    
                        if (depositCountsPerMonthForPlayers[monthName] !== undefined) {
                            depositCountsPerMonthForPlayers[monthName]++;
                        }
                    }
                });
            }
        });
    
        return { 
            players,
            totalCount,
            depositCountsPerMonth
        };
    }
    
}
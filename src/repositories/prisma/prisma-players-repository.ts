import { Prisma, Player } from '@prisma/client'
import { PlayersRepository } from '../players-repository'
import { prisma } from '@/lib/prisma'
import { AnoInvalido } from '@/use-cases/@errors/error-ano-invalido'

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
    
        // Corrige as datas para incluir o intervalo completo
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
    
        // Inicializa o mapa de contagem de depósitos por mês
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
    
                    // Verifica se a transação está dentro do intervalo
                    if (transactionDate >= dataInicioCorrigida && transactionDate <= dataFimCorrigida) {
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
                    }
    
                    // Para os depósitos após o FTD, adiciona no mapa de meses
                    const monthNumber = transactionDate.getUTCMonth() + 1;
                    const monthNames = [
                        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                    ];
                    const monthName = monthNames[monthNumber - 1];
    
                    // Soma o valor da transação ao mês correspondente
                    const transactionAmount = transaction.valor_total_transactions ?? 0;
                    depositAmountPerMonth[monthName].amount += transactionAmount;
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

    async calculateMonthlyAverageTicket(ano: string): Promise<{ 
        averageTicket: { 
            [key: string]: { qtd_jogadores: number, totalAmount: number, average: number }
        }
    }> {
        // Define as datas de início e fim do ano
        const startDate = new Date(`${ano}-01-01T00:00:00Z`);
        const endDate = new Date(`${ano}-03-31T23:59:59.999Z`);
    
        // Busca todos os jogadores e suas transações de depósito para o ano especificado
        const players = await prisma.player.findMany({
            where: {
                Wallet: {
                    ftd_date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                Transactions_month: {
                    some: {
                        type_transactions: 'DEPOSIT'
                    }
                }
            },
            include: {
                Transactions_month: {
                    where: {
                        type_transactions: 'DEPOSIT'
                    }
                },
                Wallet: true
            }
        });
    
        // Inicializa o objeto para armazenar o ticket médio por mês
        const averageTicket: { 
            [key: string]: { qtd_jogadores: number, totalAmount: number, average: number }
        } = {};
    
        // Itera sobre os jogadores e agrupa os dados por mês do primeiro depósito
        players.forEach(player => {
            const ftdDate = player.Wallet?.ftd_date;
            if (!ftdDate) return;
    
            // Obtém o mês e o ano do primeiro depósito (ftd_date)
            const date = new Date(ftdDate);
            const ftdMonth = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
            // Se o mês ainda não foi inicializado no objeto, faz isso agora
            if (!averageTicket[ftdMonth]) {
                averageTicket[ftdMonth] = {
                    qtd_jogadores: 0,
                    totalAmount: 0,
                    average: 0
                };
            }
    
            // Incrementa a quantidade de jogadores no mês
            averageTicket[ftdMonth].qtd_jogadores += 1;
    
            // Soma o total das transações de depósito para esse jogador
            player.Transactions_month.forEach(transaction => {
                averageTicket[ftdMonth].totalAmount += transaction.valor_total_transactions;
            });
        });
    
        // Calcula o ticket médio (totalAmount / qtd_jogadores) para cada mês
        Object.keys(averageTicket).forEach(month => {
            const { totalAmount, qtd_jogadores } = averageTicket[month];
            averageTicket[month].average = qtd_jogadores > 0 ? totalAmount / qtd_jogadores : 0;
        });
    
        return { averageTicket };
    }
}
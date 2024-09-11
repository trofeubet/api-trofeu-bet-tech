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
        // Valida o parâmetro do ano
        const year = parseInt(ano);
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
            throw new AnoInvalido();
        }
    
        // Calcula o início e o fim do ano especificado
        const startDate = new Date(`${year}-01-01T00:00:00Z`);
        const endDate = new Date(`${year + 1}-01-01T00:00:00Z`);
    
        // Busca todos os jogadores e inclui suas transações e carteira, filtrando por ano
        const players = await prisma.player.findMany({
            where: {
                Wallet: {
                    ftd_date: {
                        gte: startDate,
                        lt: endDate
                    }
                }
            },
            include: {
                Transactions_month: true,
                Wallet: true
            }
        });
    
        // Objeto para armazenar os dados de ticket médio por mês
        const averageTicket: { 
            [key: string]: { qtd_jogadores: number, totalAmount: number, average: number }
        } = {};
    
        // Itera sobre os jogadores e agrupa por ftd_date (mês do primeiro depósito)
        players.forEach(player => {
            // Verifica se Wallet e ftd_date são válidos
            const ftdDate = player.Wallet?.ftd_date;
            if (!ftdDate) return; // Pule jogadores sem data de primeiro depósito
    
            const date = new Date(ftdDate);
            if (date.getFullYear() !== year) return; // Pule jogadores cujo ftd_date não é do ano especificado
    
            const ftdMonth = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
            // Se o mês não existir no objeto, inicializa
            if (!averageTicket[ftdMonth]) {
                averageTicket[ftdMonth] = {
                    qtd_jogadores: 0,
                    totalAmount: 0,
                    average: 0
                };
            }
    
            // Incrementa a quantidade de jogadores nesse mês
            averageTicket[ftdMonth].qtd_jogadores += 1;
    
            // Soma o total de transações do jogador para o mês específico
            player.Transactions_month.forEach(transaction => {
                if (transaction.type_transactions === 'DEPOSIT') {
                    averageTicket[ftdMonth].totalAmount += transaction.valor_total_transactions;
                }
            });
        });
    
        // Calcula o ticket médio para cada mês (totalAmount / qtd_jogadores)
        Object.keys(averageTicket).forEach(month => {
            const totalAmount = averageTicket[month].totalAmount;
            const qtd_jogadores = averageTicket[month].qtd_jogadores;
    
            // Calcula o ticket médio do mês
            averageTicket[month].average = qtd_jogadores > 0 ? totalAmount / qtd_jogadores : 0;
        });
    
        return { averageTicket };
    }
}
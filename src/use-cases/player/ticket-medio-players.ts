import { PlayersRepository } from "@/repositories/players-repository";
import { AnoInvalido } from "../@errors/error-ano-invalido";
import { ErrorLoadingAverageTicket } from "../@errors/error-loading-average-ticket";

interface GetTicketMedioUseCaseRequest {
    ano: string;
}

interface GetTicketMedioUseCaseResponse {
    averageTicket: { [key: string]: { qtd_jogadores: number, totalAmount: number, average: number } };
}

export class GetTicketMedioUseCase {
    constructor(
        private playersRepository: PlayersRepository
    ) {}

    async execute({
        ano
    }: GetTicketMedioUseCaseRequest): Promise<GetTicketMedioUseCaseResponse> {
        const year = parseInt(ano);
        const currentYear = new Date().getFullYear();

        if (isNaN(year) || year < 1900 || year > currentYear) {
            throw new AnoInvalido();
        }

        // Lista de meses em ordem
        const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

        // Define o tamanho do lote para dividir as consultas
        const batchSize = 2; // Ajuste conforme necessário
        const monthBatches = [];

        // Divide a lista de meses em lotes
        for (let i = 0; i < months.length; i += batchSize) {
            monthBatches.push(months.slice(i, i + batchSize));
        }

        const monthResults = [];

        // Processa cada lote de meses
        for (const batch of monthBatches) {
            const batchPromises = batch.map(async (month, index) => {
                // Pular o mês de abril
                if (month === 'abril') {
                    console.warn(`Pular processamento do mês ${month}`);
                    return null; // Retorna null para meses que devem ser pulados
                }

                const monthIndex = months.indexOf(month);
                const date_init = new Date(year, monthIndex, 1);
                const date_finish = new Date(year, monthIndex + 1, 0); // Último dia do mês

                try {
                    const qtd_jogadores = await this.playersRepository.getQtdPlayersMonthByFtdDate(date_init, date_finish);
                    const totalAmount = await this.playersRepository.getTotalAmountMonthByFtdDate(date_init, date_finish);

                    if (typeof qtd_jogadores !== 'number' || typeof totalAmount !== 'number') {
                        throw new Error(`Dados inesperados: qtd_jogadores ou totalAmount não é um número.`);
                    }

                    const average = qtd_jogadores > 0 ? totalAmount / qtd_jogadores : 0;

                    return {
                        month,
                        result: {
                            qtd_jogadores,
                            totalAmount,
                            average
                        }
                    };
                } catch (error) {
                    console.error(`Erro ao consultar dados para o mês ${month}:`, error);
                    throw new ErrorLoadingAverageTicket(`Erro ao processar dados para o mês ${month}`);
                }
            });

            // Aguarda a resolução de todas as promessas no lote
            const batchResults = await Promise.all(batchPromises);

            // Filtra resultados válidos e adiciona ao array de resultados
            monthResults.push(batchResults.filter(result => result !== null));
        }

        // Converte o array de resultados em um objeto
        const averageTicket = monthResults.flat().reduce((acc, { month, result }) => {
            acc[month] = result;
            return acc;
        }, {} as GetTicketMedioUseCaseResponse['averageTicket']);

        return { 
            averageTicket
        };
    }
}

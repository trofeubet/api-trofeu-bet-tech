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

        // Cria um array de Promises para cada mês e aguarda todas serem resolvidas
        const monthPromises = months.map(async (month, i) => {
            const date_init = new Date(year, i, 1);
            const date_finish = new Date(year, i + 1, 0);  // Último dia do mês

            try {
                // Obtém a quantidade de jogadores e o total de valores para o mês
                const qtd_jogadores = await this.playersRepository.getQtdPlayersMonthByFtdDate(date_init, date_finish);
                const totalAmount = await this.playersRepository.getTotalAmountMonthByFtdDate(date_init, date_finish);

                // Verifica se o resultado das consultas é do tipo esperado
                if (typeof qtd_jogadores !== 'number' || typeof totalAmount !== 'number') {
                    throw new Error(`Dados inesperados: qtd_jogadores ou totalAmount não é um número.`);
                }

                // Calcula a média
                const average = qtd_jogadores > 0 ? totalAmount / qtd_jogadores : 0;

                // Retorna o resultado para o mês atual
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

        // Resolve todas as Promises e converte para o formato desejado
        const monthResults = await Promise.all(monthPromises);

        // Converte o array de resultados em um objeto
        const averageTicket = monthResults.reduce((acc, { month, result }) => {
            acc[month] = result;
            return acc;
        }, {} as GetTicketMedioUseCaseResponse['averageTicket']);

        return { 
            averageTicket
        };
    }
}

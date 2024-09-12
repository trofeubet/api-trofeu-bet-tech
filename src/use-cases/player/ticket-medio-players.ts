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
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
            throw new AnoInvalido();
        }
        
        // Lista de meses em ordem
        const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
        
        // Inicializa o objeto para armazenar o ticket médio por mês
        const averageTicket: { 
            [key: string]: { qtd_jogadores: number, totalAmount: number, average: number }
        } = {};

        // Itera sobre cada mês do ano
        for (let i = 0; i < 12; i++) {
            // Define o início e o fim do mês
            const date_init = new Date(year, i, 1);
            const date_finish = new Date(year, i + 1, 0);  // Último dia do mês
            
            try {
                // Obtém a quantidade de jogadores e o total de valores para o mês
                const qtd_jogadores = await this.playersRepository.getQtdPlayersMonthByFtdDate(date_init, date_finish);
                const totalAmount = await this.playersRepository.getTotalAmountMonthByFtdDate(date_init, date_finish);
                
                // Calcula a média
                const average = qtd_jogadores > 0 ? totalAmount / qtd_jogadores : 0;
                
                // Armazena o resultado no objeto
                averageTicket[months[i]] = {
                    qtd_jogadores,
                    totalAmount,
                    average
                };

            } catch (error) {
                console.error(`Erro ao consultar dados para o mês ${months[i]}:`, error);
                throw new ErrorLoadingAverageTicket();
            }
        }
 
        return { 
            averageTicket
        };
    }
}

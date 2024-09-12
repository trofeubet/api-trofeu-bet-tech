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
        
        const { averageTicket } = await this.playersRepository.calculateMonthlyAverageTicket(ano);

        if(!averageTicket) throw new ErrorLoadingAverageTicket();
 
        return { 
            averageTicket
        };
    }
}

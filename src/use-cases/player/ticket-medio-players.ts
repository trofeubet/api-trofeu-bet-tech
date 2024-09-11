import { PlayersRepository } from "@/repositories/players-repository";

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
        
        const { averageTicket } = await this.playersRepository.calculateMonthlyAverageTicket(ano);
 
        return { 
            averageTicket
        };
    }
}

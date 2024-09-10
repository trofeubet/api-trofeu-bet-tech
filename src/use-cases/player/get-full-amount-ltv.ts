import { PlayersRepository } from "@/repositories/players-repository";
import { Player } from "@prisma/client";

interface getFullAmountLtvUseCaseRequest {
    date_init: string;
    date_finish: string;
}

interface getFullAmountLtvUseCaseResponse {
    totalAmount: number;
    depositAmountPerMonth: { [key: string]: { amount: number, percentage: number } };
}

export class GetFullAmountLtvUseCase {
    constructor(
        private playersRepository: PlayersRepository
    ) {}
    
    async execute({
        date_init, date_finish
    }: getFullAmountLtvUseCaseRequest): Promise<getFullAmountLtvUseCaseResponse> {

        const data_inicio = new Date(date_init);
        const data_fim = new Date(date_finish);

        const { players, totalAmount, depositAmountPerMonth } = await this.playersRepository.getFullAmountByFtdDate(data_inicio, data_fim);

        if (!players || players.length === 0) {
            return {
                totalAmount: 0,
                depositAmountPerMonth
            };
        }

        return { 
            totalAmount,
            depositAmountPerMonth
        };
    }
}

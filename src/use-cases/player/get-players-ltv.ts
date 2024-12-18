import { PlayersRepository } from "@/repositories/players-repository";
import { Player } from "@prisma/client";

interface getPlayersLtvUseCaseRequest {
    date_init: string;
    date_finish: string;
}

interface getPlayersLtvUseCaseResponse {
    totalCount: number;
    depositCountsPerMonth: { [key: string]: { count: number, percentage: number } };
}

export class GetPlayersLtvUseCase {
    constructor(
        private playersRepository: PlayersRepository
    ) {}
    
    async execute({
        date_init, date_finish
    }: getPlayersLtvUseCaseRequest): Promise<getPlayersLtvUseCaseResponse> {

        const data_inicio = new Date(date_init);
        const data_fim = new Date(date_finish);

        const { players, totalCount, depositCountsPerMonth } = await this.playersRepository.getPlayersByFtdDate(data_inicio, data_fim);

        if (!players || players.length === 0) {
            return {
                totalCount: 0,
                depositCountsPerMonth
            };
        }

        return { 
            totalCount,
            depositCountsPerMonth
        };
    }
}

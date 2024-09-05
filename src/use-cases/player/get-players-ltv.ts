import { PlayersRepository } from "@/repositories/players-repository";
import { Player } from "@prisma/client";

interface getPlayersLtvUseCaseRequest {
    date_init: string;
    date_finish: string;
}

interface getPlayersLtvUseCaseResponse {
    // playersList: {
    //     id: string;
    //     name: string;
    //     email: string;
    //     cpf: string | null; // Permite null
    //     tell: string;
    //     id_platform: number;
    //     date_created: Date;
    //     Transactions_month: {
    //         id: string;
    //         id_player: string;
    //         cpf: string | null; // Permite null
    //         date_transactions: Date | null; // Permite null
    //         type_transactions: string;
    //         valor_total_transactions: number;
    //         date_created: Date;
    //     }[];
    // }[];
    totalCount: number;
    depositCountsPerMonth: { [key: string]: number };
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

        const { players, totalCount, depositCountsPerMonth } = await this.playersRepository.getPlayersByPlatformRegistrationDate(data_inicio, data_fim);

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

import { PlayersRepository } from "@/repositories/players-repository";
import { Player, Transactions } from "@prisma/client";
import { PlayerNotExistsError } from "../@errors/player-not-exists";

interface getPlayerUniqueByIdPlatformUseCaseRequest {
    id_platform: number;
}

interface getPlayerUniqueByIdPlatformUseCaseResponse {
    player: {
        id: string;
        id_platform: number;
        name: string;
        cpf: string | null;
        tell: string;
        email: string;
        date_created: Date;
        date_birth: Date | null;
        platform_regitration_date: Date | null;
        Transactions_month: {
            id: string;
            id_player: string;
            cpf: string;
            date_transactions: Date | null;
            type_transactions: Transactions;
            valor_total_transactions: number;
            date_created: Date;
        }[];
        Wallet: {
            id: string;
            id_player: string;
            ftd_value: number;
            ftd_date: Date | null;
            qtd_deposits: number;
            total_deposit_amount: number;
            total_withdrawals: number;
            qtd_withdrawals: number;
        } | null;
    }
}

export class GetPlayerUniqueByIdPlatformUseCase {
    constructor(
        private playersRepository: PlayersRepository
    ) {}
    
    async execute({
        id_platform
    }: getPlayerUniqueByIdPlatformUseCaseRequest): Promise<getPlayerUniqueByIdPlatformUseCaseResponse> {
        const playerData = await this.playersRepository.getUniquePlayerByIdPlatform(id_platform);
        if (!playerData || !playerData.player) throw new PlayerNotExistsError();

        return { 
            player: playerData.player
        };
    }
}

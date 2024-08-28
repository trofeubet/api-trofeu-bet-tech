import { PlayersRepository } from "@/repositories/players-repository";
import { Player } from "@prisma/client";
import { PlayerNotExistsError } from "../@errors/player-not-exists";
import { ErrorLoadingPlayers } from "../@errors/error-loading-players";
import { ErrorLoadingPage } from "../@errors/error-loading-page";

interface getPlayersUseCaseRequest {
    page: number;
    name?: string;
    id_platform?: number;
    tell?: string;
    email?: string;
    cpf?: string;
}

interface getPlayersUseCaseResponse {
    playersList: Player[];
    totalItens: number;
    totalPages: number;
    currentPage: number;
}

export class GetPlayersUseCase {
    constructor(
        private playersRepository: PlayersRepository
    ) {}
    
    async execute({
        page, name, id_platform, tell, email, cpf
    }: getPlayersUseCaseRequest): Promise<getPlayersUseCaseResponse> {

        if (page <= 0) page = 1;

        const take = 10;
        const { players, totalCount } = await this.playersRepository.getPlayers(take, page, name, id_platform, tell, email, cpf);

        if (!players || players.length === 0) {
            return {
                playersList: [],
                totalItens: 0,
                totalPages: 0,
                currentPage: page
            };
        }

        const totalPages = Math.ceil(totalCount / take);
        if (totalPages === 0) throw new ErrorLoadingPlayers();
        if (page > totalPages) throw new ErrorLoadingPage();

        return { 
            playersList: players,
            totalItens: totalCount,
            totalPages,
            currentPage: page
        };
    }
}

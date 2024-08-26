import { WalletRepository } from "@/repositories/wallet-repository";
import { Player, Wallet } from "@prisma/client";

interface GetWalletByCpfRequest {
    cpf: string;
}

interface GetWalletByCpfResponse {
    player: Player & { Wallet: Wallet | null};
}

export class GetWalletByCpfUseCase {
    constructor(
        private walletRepository: WalletRepository
    ) {}

    async execute({
        cpf
    }: GetWalletByCpfRequest): Promise<GetWalletByCpfResponse> {
        
        const player = await this.walletRepository.findByCpf(cpf);

        if (!player) throw new Error('Wallet não encontrada');

        return {
            player
        };
    }
}

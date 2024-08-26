import { WalletRepository } from "@/repositories/wallet-repository";
import { Wallet } from "@prisma/client";
import { PlayerNotExistsError } from "../@errors/player-not-exists";



interface UpdateWalletRequest {
    id: string;
    ftd_value?: number;
    ftd_date?: Date;
    qtd_deposits?: number;
    total_deposit_amount?: number;
    total_withdrawals?: number;
    qtd_withdrawals?: number;
}

interface UpdateWalletResponse {
    wallet: Wallet;
}

export class UpdateWalletUseCase {
    constructor(
        private walletRepository: WalletRepository
    ) {}

    async execute({
        id,
        ftd_value,
        ftd_date,
        qtd_deposits,
        total_deposit_amount,
        total_withdrawals,
        qtd_withdrawals
    }: UpdateWalletRequest): Promise<UpdateWalletResponse> {
        
        const updateWallet = await this.walletRepository.updateWallet({
            id,
            ftd_value,
            ftd_date,
            qtd_deposits,
            total_deposit_amount,
            total_withdrawals,
            qtd_withdrawals
        })

        if(!updateWallet) throw new Error('Erro ao atualizar wallet')

        return {
            wallet: updateWallet
        }
    }
}
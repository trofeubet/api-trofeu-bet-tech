import { DepositsMonthRepository } from "@/repositories/deposit-month-repository";
import { Deposits_month } from "@prisma/client";
import { PlayerNotExistsError } from "../@errors/player-not-exists";

interface UpdateDepositMonthRequest {
    id: string;
    cpf?: string;
    date_deposits?: Date;
    valor_total_deposit?: number;
}

interface UpdateDepositMonthResponse {
    deposit_month: Deposits_month;
}

export class UpdateDepositMonthUseCase {
    constructor(
        private depositsMonthRepository: DepositsMonthRepository
    ) {}

    async execute({
        id,
        cpf,
        date_deposits,
        valor_total_deposit
    }: UpdateDepositMonthRequest): Promise<UpdateDepositMonthResponse> {
        
        const verifyPlayerExist = await this.depositsMonthRepository.findByCpf(cpf ?? '');
        if(!verifyPlayerExist) throw new PlayerNotExistsError();

        const updateDepositMonth = await this.depositsMonthRepository.updateDepositsMonth({
            id,
            cpf,
            date_deposits,
            valor_total_deposit,
        })

        if(!updateDepositMonth) throw new Error('Erro ao atualizar deposit month')

        return {
            deposit_month: updateDepositMonth
        }
    }
}
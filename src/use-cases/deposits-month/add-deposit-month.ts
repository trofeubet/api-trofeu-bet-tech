import { DepositsMonthRepository } from "@/repositories/deposit-month-repository";
import { Deposits_month } from "@prisma/client";
import { PlayerNotExistsError } from "../errors/player-not-exists";
import { DepositAlreadyExist } from "../errors/deposit-already-exist";

interface AddDepositMonthRequest {
    cpf: string;
    date_deposits: Date;
    valor_total_deposit: number;
}

interface AddDepositMonthResponse {
    deposit_month: Deposits_month;
}

export class AddDepositMonthUseCase {
    constructor(
        private depositsMonthRepository: DepositsMonthRepository
    ) {}

    async execute({
        cpf,
        date_deposits,
        valor_total_deposit
    }: AddDepositMonthRequest): Promise<AddDepositMonthResponse> {
        
        const verifyPlayerExist = await this.depositsMonthRepository.findByCpf(cpf)
        if(!verifyPlayerExist) throw new PlayerNotExistsError()

        const findDepositMonth = verifyPlayerExist.Deposits_month.find(deposit => 
            deposit.date_deposits &&
            deposit.date_deposits.getMonth() === date_deposits.getMonth() &&
            deposit.date_deposits.getFullYear() === date_deposits.getFullYear()
        );
        
        if (findDepositMonth) {
            const existingMonth = findDepositMonth.date_deposits ? findDepositMonth.date_deposits.getMonth() + 1 : null; // Adiciona 1 para ajustar para o formato de mês (1-12)
            const existingYear = findDepositMonth.date_deposits ? findDepositMonth.date_deposits.getFullYear() : null;
            throw new DepositAlreadyExist(existingMonth?.toString() ?? '', existingYear?.toString() ?? '');
        }
        

        const newDepositMonth = await this.depositsMonthRepository.createDepositsMonth({
            cpf,
            date_deposits,
            valor_total_deposit,
            date_created: new Date(),
            player: {
                connect: {
                    id: verifyPlayerExist.id
                }
            }
        })

        return {
            deposit_month: newDepositMonth
        }
    }
}
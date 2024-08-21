import { DepositsMonthRepository } from "@/repositories/deposit-month-repository";
import { Deposits_month } from "@prisma/client";
import { PlayerNotExistsError } from "../@errors/player-not-exists";

interface GetDepositMonthRequest {
    cpf: string;
    date_deposits: Date;
}

interface GetDepositMonthResponse {
    deposit_month: Deposits_month;
}

export class GetDepositMonthUseCase {
    constructor(
        private depositsMonthRepository: DepositsMonthRepository
    ) {}

    async execute({
        cpf,
        date_deposits
    }: GetDepositMonthRequest): Promise<GetDepositMonthResponse> {

        const verifyPlayerExist = await this.depositsMonthRepository.findByCpf(cpf);
        if(!verifyPlayerExist) throw new PlayerNotExistsError();

        const getDepositMonthByCpfDate = await this.depositsMonthRepository.findDepositsMonthByDateCpf(
            date_deposits,
            cpf
        );
        console.log(getDepositMonthByCpfDate)

        if(!getDepositMonthByCpfDate) {
            return {
                deposit_month: {
                    id: '',
                    id_player: '',
                    cpf: '',
                    date_deposits: new Date(),
                    valor_total_deposit: 0,
                    date_created: new Date(),
                }
            }
        }

        return {
            deposit_month: getDepositMonthByCpfDate
        }
    }
}
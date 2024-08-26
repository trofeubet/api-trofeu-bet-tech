import { TransactionsMonthRepository } from "@/repositories/transactions-month-repository";
import { Transactions_month, Transactions } from "@prisma/client";
import { PlayerNotExistsError } from "../@errors/player-not-exists";

interface GetTransactionMonthRequest {
    cpf: string;
    date_transactions: Date;
    type_transactions: Transactions;
}

interface GetTransactionMonthResponse {
    transaction_month: Transactions_month;
}

export class GetTransactionMonthUseCase {
    constructor(
        private transactionsMonthRepository: TransactionsMonthRepository
    ) {}

    async execute({
        cpf,
        date_transactions,
        type_transactions
    }: GetTransactionMonthRequest): Promise<GetTransactionMonthResponse> {

        const verifyPlayerExist = await this.transactionsMonthRepository.findByCpf(cpf);
        if(!verifyPlayerExist) throw new PlayerNotExistsError();

        const getTransactionsMonthByCpfDate = await this.transactionsMonthRepository.findTransactionsMonthByDateCpf(
            date_transactions,
            cpf,
            type_transactions
        );

        if(!getTransactionsMonthByCpfDate) {
            return {
                transaction_month: {
                    id: '',
                    id_player: '',
                    cpf: '',
                    date_transactions: new Date(),
                    type_transactions: Transactions.SEM_TRANSACAO,
                    valor_total_transactions: 0,
                    date_created: new Date(),
                }
            }
        }

        return {
            transaction_month: getTransactionsMonthByCpfDate
        }
    }
}
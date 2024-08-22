import { TransactionsMonthRepository } from "@/repositories/transactions-month-repository";
import { Transactions_month, Transactions } from "@prisma/client";
import { PlayerNotExistsError } from "../@errors/player-not-exists";



interface UpdateTransactionMonthRequest {
    id: string;
    cpf?: string;
    date_transactions?: Date;
    type_transactions?: Transactions;
    valor_total_transactions?: number;
}

interface UpdateTransactionMonthResponse {
    transaction_month: Transactions_month;
}

export class UpdateTransactionMonthUseCase {
    constructor(
        private transactionsMonthRepository: TransactionsMonthRepository
    ) {}

    async execute({
        id,
        cpf,
        date_transactions,
        type_transactions,
        valor_total_transactions
    }: UpdateTransactionMonthRequest): Promise<UpdateTransactionMonthResponse> {
        
        const verifyPlayerExist = await this.transactionsMonthRepository.findByCpf(cpf ?? '');
        if(!verifyPlayerExist) throw new PlayerNotExistsError();

        const updateDepositMonth = await this.transactionsMonthRepository.updateTransactionsMonth({
            id,
            cpf,
            date_transactions,
            type_transactions,
            valor_total_transactions
        })

        if(!updateDepositMonth) throw new Error('Erro ao atualizar deposit month')

        return {
            transaction_month: updateDepositMonth
        }
    }
}
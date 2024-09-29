import { TransactionsMonthRepository } from "@/repositories/transactions-month-repository";
import { Transactions_month, Transactions } from "@prisma/client";
import { PlayerNotExistsError } from "../@errors/player-not-exists";



interface DeleteByCpfTransactionMonthRequest {
    cpf: string;
    type_transactions: "DEPOSIT" | "WITHDRAWALS";
}

interface DeleteByCpfTransactionMonthResponse {
    transaction_month: Transactions_month[] | null;
}

export class DeleteByCpfTransactionMonthUseCase {
    constructor(
        private transactionsMonthRepository: TransactionsMonthRepository
    ) {}

    async execute({
        cpf, type_transactions
    }: DeleteByCpfTransactionMonthRequest): Promise<DeleteByCpfTransactionMonthResponse> {
        
        const verifyPlayerExist = await this.transactionsMonthRepository.findByCpf(cpf ?? '');
        if(!verifyPlayerExist) throw new PlayerNotExistsError();

        const deleteTransactionsMonth = await this.transactionsMonthRepository.deleteTransactionsMonthByCpf(cpf, type_transactions)

        if(!deleteTransactionsMonth) throw new Error('Erro ao deletar transactions month')

        return {
            transaction_month: deleteTransactionsMonth
        }
    }
}
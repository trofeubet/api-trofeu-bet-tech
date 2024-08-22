import { TransactionsMonthRepository } from "@/repositories/transactions-month-repository";
import { Transactions_month, Transactions } from "@prisma/client";
import { PlayerNotExistsError } from "../@errors/player-not-exists";
import { DepositAlreadyExist } from "../@errors/deposit-already-exist";

interface AddTransactionsMonthRequest {
    cpf: string;
    date_transactions: Date;
    valor_total_transactions: number;
    type_transactions: Transactions;
}

interface AddTransactionsMonthResponse {
    transactions_month: Transactions_month;
}

export class AddTransactionsMonthUseCase {
    constructor(
        private transactionsMonthRepository: TransactionsMonthRepository
    ) {}

    async execute({
        cpf,
        date_transactions,
        valor_total_transactions,
        type_transactions
    }: AddTransactionsMonthRequest): Promise<AddTransactionsMonthResponse> {
        
        const verifyPlayerExist = await this.transactionsMonthRepository.findByCpf(cpf)
        if(!verifyPlayerExist) throw new PlayerNotExistsError()

        const findTransactionMonth = verifyPlayerExist.Transactions_month.find(transactions => 
            transactions.date_transactions &&
            transactions.date_transactions.getMonth() === date_transactions.getMonth() &&
            transactions.date_transactions.getFullYear() === date_transactions.getFullYear() &&
            transactions.type_transactions === type_transactions
        );
        
        if (findTransactionMonth) {
            const existingMonth = findTransactionMonth.date_transactions ? findTransactionMonth.date_transactions.getMonth() + 1 : null; // Adiciona 1 para ajustar para o formato de mês (1-12)
            const existingYear = findTransactionMonth.date_transactions ? findTransactionMonth.date_transactions.getFullYear() : null;
            if (type_transactions === Transactions.DEPOSIT) {
                throw new DepositAlreadyExist(existingMonth?.toString() ?? '', existingYear?.toString() ?? '');
            }
        }
        

        const newTransactionsMonth = await this.transactionsMonthRepository.createTransactionsMonth({
            cpf,
            date_transactions,
            type_transactions,
            valor_total_transactions,
            date_created: new Date(),
            player: {
                connect: {
                    id: verifyPlayerExist.id
                }
            }
        })

        return {
            transactions_month: newTransactionsMonth
        }
    }
}